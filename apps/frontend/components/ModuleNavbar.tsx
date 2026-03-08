'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export function ModuleNavbar() {
  const pathname = usePathname();

  const isIndigoRoute = pathname.startsWith('/indigo');
  const isWarpingRoute = pathname.startsWith('/warping');
  const isSaconRoute = pathname.startsWith('/sacon');
  const isWeavingRoute = pathname.startsWith('/weaving');
  const isInspectGrayRoute = pathname.startsWith('/inspect-gray');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  const isSpinningRoute =
    !isIndigoRoute &&
    !isWarpingRoute &&
    !isSaconRoute &&
    !isWeavingRoute &&
    !isInspectGrayRoute &&
    !isAuthRoute;

  return (
    <nav className="module-navbar">
      <div className="container">
        <div className="module-navbar-inner">
          <div className="module-navbar-brand">
            <span className="brand-mark" />
            <div className="brand-text">
              <span className="brand-title">Yarn ERP</span>
              <span className="brand-subtitle">PT Triputra Textile Industry</span>
            </div>
          </div>
          <div className="module-navbar-content">
            <Link
              href="/"
              className={`module-nav-link ${isSpinningRoute ? 'active' : ''}`}
            >
              Spinning
            </Link>
            <Link
              href="/sacon"
              className={`module-nav-link ${isSaconRoute ? 'active' : ''}`}
            >
              Sacon
            </Link>
            <Link
              href="/warping"
              className={`module-nav-link ${isWarpingRoute ? 'active' : ''}`}
            >
              Warping
            </Link>
            <Link
              href="/indigo"
              className={`module-nav-link ${isIndigoRoute ? 'active' : ''}`}
            >
              Indigo
            </Link>
            <Link
              href="/weaving"
              className={`module-nav-link ${isWeavingRoute ? 'active' : ''}`}
            >
              Weaving
            </Link>
            <Link
              href="/inspect-gray"
              className={`module-nav-link ${isInspectGrayRoute ? 'active' : ''}`}
            >
              Inspect Gray
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

