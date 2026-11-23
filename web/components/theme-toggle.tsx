"use client";

import { useTheme } from "next-themes";
import { SunMoonIcon } from "@/components/icons/sun-moon";
import { Button } from "@/components/ui/button";
import { useAnimatedIcon } from "@/components/ui/animated-icon";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { icon, hover } = useAnimatedIcon(SunMoonIcon);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Switch light or dark theme"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      {...hover}
    >
      {icon}
    </Button>
  );
}
