"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in on route change
    setIsVisible(false);
    // Small delay to allow DOM to update
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, [pathname]);

  return (
    <div
      className={`page-content transition-opacity duration-150 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
