'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  SpinningSubNavbar,
  MainNavigation,
  ProductionNavigation,
} from './SpinningNavigation';
import { useAuth } from '../lib/AuthContext';

export function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const isIndigoRoute = pathname.startsWith('/indigo');
  const isWarpingRoute = pathname.startsWith('/warping');
  const isSaconRoute = pathname.startsWith('/sacon');
  const isWeavingRoute = pathname.startsWith('/weaving');
  const isInspectGrayRoute = pathname.startsWith('/inspect-gray');
  const isDenimRoute = pathname.startsWith('/denim');
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isProductionRoute = pathname.startsWith('/production');

  const isSpinningRoute =
    !isIndigoRoute &&
    !isWarpingRoute &&
    !isSaconRoute &&
    !isWeavingRoute &&
    !isInspectGrayRoute &&
    !isDenimRoute &&
    !isAuthRoute;

  const isSpinningDivisionRoute =
    !isIndigoRoute &&
    !isWarpingRoute &&
    !isSaconRoute &&
    !isWeavingRoute &&
    !isInspectGrayRoute &&
    !isDenimRoute &&
    !isAuthRoute;

  return (
    <>
      {/* Module Navbar - Division Switcher */}
      {!isAuthRoute && (
        <nav className="module-navbar">
          <div className="container">
            <div className="module-navbar-inner">
              <Link href="/" className="module-navbar-brand">
                <span className="brand-mark" />
                <div className="brand-text">
                  <span className="brand-title">Yarn ERP</span>
                  <span className="brand-subtitle">PT Triputra Textile Industry</span>
                </div>
              </Link>
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
                  href="/denim/sales-contract"
                  className={`module-nav-link ${isDenimRoute ? 'active' : ''}`}
                >
                  Denim
                </Link>
                <Link
                  href="/inspect-gray"
                  className={`module-nav-link ${isInspectGrayRoute ? 'active' : ''}`}
                >
                  Inspect Gray
                </Link>
                {!isLoading && user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {user.name} ({user.role})
                    </span>
                    <button
                      onClick={logout}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* App Header - Title and Navigation */}
      {!isAuthRoute && (
        <header
          className={isProductionRoute ? 'app-header app-header--production' : 'app-header'}
        >
          <div className="container">
            <h1>
              {isProductionRoute
                ? 'Production Management'
                : isSpinningDivisionRoute
                  ? 'Yarn Quality ERP System'
                  : 'Yarn Quality ERP System'}
            </h1>
            <p className="subtitle">
              PT Triputra Textile Industry -{' '}
              {isIndigoRoute
                ? 'Indigo Division'
                : isWarpingRoute
                  ? 'Warping Division'
                  : isSaconRoute
                    ? 'Sacon Division'
                    : isWeavingRoute
                      ? 'Weaving Division'
                      : isDenimRoute
                        ? 'Denim Division'
                        : isInspectGrayRoute
                          ? 'Inspect Gray Division'
                          : 'Spinning Division'}
            </p>

            {/* Spinning division module switcher (Quality / Production) */}
            {isSpinningDivisionRoute && <SpinningSubNavbar />}

            {/* Within Spinning, show the appropriate module-level navigation */}
            {isSpinningDivisionRoute ? (
              isProductionRoute ? (
                <ProductionNavigation />
              ) : (
                <MainNavigation />
              )
            ) : null}
          </div>
        </header>
      )}
    </>
  );
}
