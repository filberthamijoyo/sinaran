'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import {
  SpinningSubNavbar,
  MainNavigation,
  ProductionNavigation,
} from './SpinningNavigation';

export function AppHeader() {
  const pathname = usePathname();
  const isProductionRoute = pathname.startsWith('/production');
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isIndigoRoute = pathname.startsWith('/indigo');
  const isWarpingRoute = pathname.startsWith('/warping');
  const isSaconRoute = pathname.startsWith('/sacon');
  const isWeavingRoute = pathname.startsWith('/weaving');
  const isInspectGrayRoute = pathname.startsWith('/inspect-gray');
  const isSpinningDivisionRoute =
    !isIndigoRoute &&
    !isWarpingRoute &&
    !isSaconRoute &&
    !isWeavingRoute &&
    !isInspectGrayRoute &&
    !isAuthRoute;

  if (isAuthRoute) {
    return null;
  }

  return (
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
  );
}
