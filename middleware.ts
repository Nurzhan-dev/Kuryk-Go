import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
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
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Получаем сессию. Это обновит куки, если они истекли.
  const { data: { session } } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname === '/sign-in' || url.pathname === '/sign-up'

  // Если нет сессии и мы не на страницах логина
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Если сессия есть и мы на странице логина — уходим на главную
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Исключаем все системные файлы, картинки и манифесты, 
     * чтобы не было ошибки Syntax Error в консоли.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
