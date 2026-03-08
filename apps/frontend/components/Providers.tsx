'use client';

import React from "react";
import { AuthProvider } from "../lib/AuthContext";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  // Legacy CRA app did not use any top-level context providers
  // other than React Router's <BrowserRouter>, which is replaced
  // by Next.js routing. This component is a convenient place to
  // add shared providers (theme, auth, query, etc.) as needed.
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export default Providers;

