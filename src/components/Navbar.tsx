"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Heart, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home", icon: Heart },
  { href: "/upload", label: "Share", icon: Camera, primary: true },
  { href: "/wall", label: "Wall", icon: LayoutGrid },
];

/**
 * Phones: a floating bottom tab bar in the thumb zone with a raised
 * "Share" action. ≥768px: a floating glass pill at the top.
 */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-3 z-40 mx-auto max-w-sm",
        "bottom-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "md:bottom-auto md:top-4 md:max-w-max",
      )}
    >
      <ul className="glass shadow-soft grid grid-cols-3 items-end rounded-[1.75rem] px-2 pb-1.5 pt-1.5 md:flex md:items-center md:gap-1 md:rounded-full md:p-1.5">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          if (link.primary) {
            return (
              <li key={link.href} className="flex justify-center md:block">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="group flex flex-col items-center gap-1 md:flex-row md:gap-2 md:rounded-full md:bg-brand md:px-5 md:py-2.5 md:text-sm md:font-semibold md:text-primary-foreground md:shadow-glow"
                >
                  <span className="-mt-9 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-glow ring-4 ring-background transition-transform duration-200 group-active:scale-90 md:hidden">
                    <Icon size={26} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <Icon size={18} className="hidden md:block" aria-hidden="true" />
                  <span
                    className={cn(
                      "text-[11px] font-semibold md:text-sm",
                      active ? "text-gold-ink md:text-primary-foreground" : "text-muted-foreground md:text-primary-foreground",
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold transition-colors md:h-11 md:flex-row md:gap-2 md:rounded-full md:px-5 md:text-sm",
                  active ? "text-gold-ink" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-2xl bg-primary/10 md:rounded-full"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={active ? 2.25 : 1.75}
                  fill={active && link.href === "/" ? "currentColor" : "none"}
                  className="relative md:size-[18px]"
                  aria-hidden="true"
                />
                <span className="relative">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
