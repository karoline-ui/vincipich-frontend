import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Cliente do Supabase que lê o cookie de sessão
  const supabase = createMiddlewareClient({ req, res });

  // Rotas públicas (não exigir login)
  const publicPaths = ['/login'];
  const { pathname } = req.nextUrl;

  if (publicPaths.includes(pathname)) {
    return res;
  }

  // Pega sessão do usuário via cookie
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não tiver sessão, manda pro login
  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    // opcional: voltar para a página depois do login
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
