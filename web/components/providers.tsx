"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-center"
      toastOptions={{ className: "!font-sans !text-[13px] !bg-surface-elevated !border-border !text-foreground" }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        {children}
        <ThemedToaster />
      </MotionConfig>
    </ThemeProvider>
  );
}
