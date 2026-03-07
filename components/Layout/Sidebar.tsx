"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    PenLine,
    BarChart3,
    Lightbulb,
    Settings,
    Snowflake,
    Wallet,
    BluetoothSearching,
    LogOut,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";

const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "text-sky-500" },
    { label: "Daily Log", icon: PenLine, href: "/log", color: "text-violet-500" },
    { label: "Statistics", icon: BarChart3, href: "/stats", color: "text-pink-700" },
    { label: "AI Advice", icon: Lightbulb, href: "/advice", color: "text-orange-700" },
    { label: "Settings", icon: Settings, href: "/settings", color: "text-gray-500" },
    { label: "Cool Down", icon: Snowflake, href: "/wishlist", color: "text-cyan-500" },
    { label: "Smart Wallet", icon: BluetoothSearching, href: "/wallet", color: "text-indigo-500" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r border-border">
            <div className="px-3 py-2 flex-1">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center pl-3 mb-10 group cursor-pointer">
                    <div className="relative h-11 w-11 mr-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/25 group-hover:shadow-lg rounded-xl bg-indigo-600 flex items-center justify-center shadow-md border border-indigo-500">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight group-hover:text-indigo-600 transition-colors">
                            Smart Spend
                        </h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                            Finance Manager
                        </p>
                    </div>
                </Link>

                {/* Nav links */}
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-lg transition",
                                pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom: user info + theme + sign out */}
            <div className="px-3 py-2 border-t border-border space-y-3">
                {/* User info */}
                {session?.user && (
                    <div className="px-3 py-2 rounded-lg bg-accent/50">
                        <p className="text-xs font-semibold text-foreground truncate">
                            {session.user.name ?? session.user.email}
                        </p>
                        {session.user.name && (
                            <p className="text-[10px] text-muted-foreground truncate">
                                {session.user.email}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between px-3">
                    <p className="text-xs text-muted-foreground font-medium">Theme</p>
                    <ModeToggle />
                </div>

                {/* Sign out */}
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition group"
                >
                    <LogOut className="h-4 w-4 group-hover:text-red-500 transition" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
