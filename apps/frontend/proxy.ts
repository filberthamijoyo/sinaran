import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type UserRole = 'factory' | 'jakarta' | 'admin';

interface ErpUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stage?: string;
}

function getCookie(request: NextRequest, name: string): string | null {
  const value = request.cookies.get(name)?.value;
  return value ?? null;
}

/**
 * Defensively parse the erp_user cookie.
 * Next.js/request.cookies returns the value already URL-decoded,
 * so decodeURIComponent is applied only to guard against double-encoding.
 * Returns null on ANY failure — callers must NOT redirect to login
 * when null is returned; the client AuthContext can still read localStorage.
 */
function parseUserFromCookie(value: string | null): ErpUser | null {
  if (!value) return null;
  try {
    // Next.js decodes cookies automatically, but guard against
    // a value that still needs decoding (e.g. leftover %20 spaces).
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed.role !== 'string') return null;
    return parsed as ErpUser;
  } catch {
    return null;
  }
}

/**
 * homeRedirect — safe for all roles, never returns an undefined stage.
 * Stage checking is NOT done here for proxy redirects (stage enforcement
 * belongs in client components). This function is only used for role-based
 * redirects when a user visits a path they don't have access to.
 */
function homeRedirect(role: string, stage?: string): string {
  if (role === 'admin') return '/denim/admin/dashboard';
  if (role === 'jakarta') return '/denim/approvals/pending';
  // Factory: always default to warping; never produce /denim/inbox/undefined
  const safeStage =
    stage && stage !== 'undefined' && stage !== 'null' && stage.length > 0
      ? stage
      : 'warping';
  return `/denim/inbox/${safeStage}`;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = getCookie(request, 'erp_token');
  const userCookie = getCookie(request, 'erp_user');

  // ── /login: always allow through ───────────────────────────────
  if (pathname === '/login') {
    // If the user IS authenticated (has a valid token), send them
    // to their role home instead of showing the login form.
    if (token) {
      const user = parseUserFromCookie(userCookie);
      if (user) {
        return NextResponse.redirect(
          new URL(homeRedirect(user.role, user.stage), request.url),
        );
      }
      // Token exists but user cookie is unreadable — redirect to a
      // safe factory default; client AuthContext will re-read localStorage.
      return NextResponse.redirect(
        new URL('/denim/inbox/warping', request.url),
      );
    }
    return NextResponse.next();
  }

  // ── Unauthenticated (no token cookie) → login ──────────────────
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Token exists but user cookie is unreadable ─────────────────
  // Do NOT redirect to login here — the client AuthContext reads from
  // localStorage (not cookies) and can handle the user object directly.
  // Redirecting to login would cause a loop when the token IS valid.
  if (!userCookie) {
    return NextResponse.next();
  }

  // ── Token + user cookie: parse, validate role ──────────────────
  const user = parseUserFromCookie(userCookie);

  if (!user) {
    // Cookie exists but is corrupt. Let the request through — the client
    // AuthContext will read localStorage and handle auth gracefully.
    return NextResponse.next();
  }

  const { role } = user;

  // ── /denim/admin/* → admin only ────────────────────────────────
  if (pathname.startsWith('/denim/admin/')) {
    if (role !== 'admin') {
      return NextResponse.redirect(
        new URL(homeRedirect(role, user.stage), request.url),
      );
    }
    return NextResponse.next();
  }

  // ── /denim/approvals/* → admin or jakarta only ─────────────────
  if (pathname.startsWith('/denim/approvals/')) {
    if (role !== 'admin' && role !== 'jakarta') {
      return NextResponse.redirect(
        new URL(homeRedirect(role, user.stage), request.url),
      );
    }
    return NextResponse.next();
  }

  // ── /denim/inbox/* → admin or factory (any stage) ───────────────
  // NO stage-level check here — a factory user is valid for any
  // /denim/inbox/{stage} route. Stage enforcement is client-side.
  if (pathname.startsWith('/denim/inbox/')) {
    if (role !== 'admin' && role !== 'factory') {
      return NextResponse.redirect(
        new URL(homeRedirect(role, user.stage), request.url),
      );
    }
    return NextResponse.next();
  }

  // ── All other /denim/* → any authenticated user ─────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/denim',
    '/denim/:path*',
    '/login',
    '/login/:path*',
  ],
};
