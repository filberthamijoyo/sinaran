'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export function MainNavigation() {
  const pathname = usePathname();

  return (
    <nav className="app-nav">
      <Link
        href="/quality/new"
        className={
          pathname === '/' || pathname === '/quality/new' || pathname.startsWith('/quality/edit')
            ? 'nav-link active'
            : 'nav-link'
        }
      >
        Enter Data
      </Link>
      <Link
        href="/quality"
        className={pathname === '/quality' ? 'nav-link active' : 'nav-link'}
      >
        View Data
      </Link>
      <Link
        href="/admin"
        className={pathname === '/admin' ? 'nav-link active' : 'nav-link'}
      >
        Settings
      </Link>
    </nav>
  );
}

export function SpinningSubNavbar() {
  const pathname = usePathname();
  const isProductionRoute = pathname.startsWith('/production');
  const isQualityRoute = !isProductionRoute;

  return (
    <nav className="spinning-subnav app-nav">
      <Link
        href="/"
        className={isQualityRoute ? 'nav-link active' : 'nav-link'}
      >
        Quality
      </Link>
      <Link
        href="/production"
        className={isProductionRoute ? 'nav-link active' : 'nav-link'}
      >
        Production
      </Link>
    </nav>
  );
}

export function ProductionNavigation() {
  const pathname = usePathname();

  const isNewOrEdit =
    pathname === '/production/new' || pathname.startsWith('/production/edit');
  const isViewData =
    pathname === '/production' &&
    !pathname.startsWith('/production/new') &&
    !pathname.startsWith('/production/edit') &&
    !pathname.startsWith('/production/view') &&
    !pathname.startsWith('/production/report') &&
    !pathname.startsWith('/production/count-wise-summary') &&
    !pathname.startsWith('/production/admin');

  return (
    <nav className="app-nav">
      <Link
        href="/production/new"
        className={isNewOrEdit ? 'nav-link active' : 'nav-link'}
      >
        Enter Data
      </Link>
      <Link
        href="/production"
        className={isViewData ? 'nav-link active' : 'nav-link'}
      >
        View Data
      </Link>
      <Link
        href="/production/admin"
        className={
          pathname === '/production/admin' ? 'nav-link active' : 'nav-link'
        }
      >
        Settings
      </Link>
    </nav>
  );
}

