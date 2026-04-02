import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Важно: используем getUser() для безопасности, но если тормозит - getSession()
  const { data: { session } } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up')
  
  // 1. Если сессии НЕТ и юзер НЕ на странице входа -> редирект на вход
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // 2. Если сессия ЕСТЬ:
  if (session) {
    const role = session.user.user_metadata?.role

    // Если залогинен и пытается зайти на sign-in/up -> уводим по ролям
    if (isAuthPage) {
      const redirectUrl = role === 'driver' ? '/driver' : '/'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Если водитель зашел на главную пассажирскую -> уводим в кабинет водителя
    if (role === 'driver' && url.pathname === '/') {
      return NextResponse.redirect(new URL('/driver', request.url))
    }
    
    // Если пассажир (или нет роли) зашел в /driver -> возвращаем на главную
    if (role !== 'driver' && url.pathname.startsWith('/driver')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Проверяем всё, кроме:
     * - api (маршруты базы)
     * - _next/static (статика)
     * - _next/image (оптимизация картинок)
     * - favicon.ico и картинки из public
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
