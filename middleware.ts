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
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
// Получаем сессию
  const { data: { session } } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  const isDriverPage = url.pathname.startsWith('/driver')
  const isAuthPage = url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up')
  const isHomePage = url.pathname === '/'

  // 1. ЕСЛИ НЕТ СЕССИИ:
  // Если юзер не авторизован и НЕ на странице входа — кидаем на /sign-in
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // 2. ЕСЛИ СЕССИЯ ЕСТЬ:
  if (session) {
    const role = session.user.user_metadata?.role

    // Если авторизован и пытается зайти на /sign-in или /sign-up
    if (isAuthPage) {
      return NextResponse.redirect(new URL(role === 'driver' ? '/driver' : '/', request.url))
    }

    // РАЗГРАНИЧЕНИЕ РОЛЕЙ:
    // Если водитель ломится на главную (пассажирскую) — кидаем в кабинет
    if (role === 'driver' && isHomePage) {
      return NextResponse.redirect(new URL('/driver', request.url))
    }

    // Если НЕ водитель (пассажир) пытается зайти в /driver — кидаем на главную
    if (role !== 'driver' && isDriverPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
