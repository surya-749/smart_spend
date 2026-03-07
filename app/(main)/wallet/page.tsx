"use client";

import { useSession, signIn } from "next-auth/react";
import { useBLE } from "@/components/BLEProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Bluetooth, BluetoothOff, MapPin, Wallet, Zap, TrendingUp,
    TrendingDown, ShieldAlert, RefreshCw, CheckCircle2, AlertTriangle, LogIn,
} from "lucide-react";

export default function WalletPage() {
    const { data: session, status: sessionStatus } = useSession();
    const { status, walletData, lastLocation, syncLog, locationError, connect, disconnect, resync } = useBLE();

    const statusColor = {
        disconnected: "text-red-400",
        connecting: "text-yellow-400",
        connected: "text-emerald-400",
    }[status];

    const statusLabel = {
        disconnected: "Disconnected",
        connecting: "Connecting…",
        connected: "Connected",
    }[status];

    // ── Loading ───────────────────────────────────────────────────────────────
    if (sessionStatus === "loading") {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading…</p>
            </div>
        );
    }

    // ── Not logged in ─────────────────────────────────────────────────────────
    if (sessionStatus === "unauthenticated") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                <div className="text-center space-y-2">
                    <Bluetooth className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                    <h2 className="text-2xl font-bold">Smart Wallet</h2>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        Sign in to connect your ESP32 wallet and sync your financial data.
                    </p>
                </div>
                <Button onClick={() => signIn()} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <LogIn className="h-4 w-4" /> Sign In to Continue
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Smart Wallet</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        BLE · OLED ·{" "}
                        <span className="text-indigo-400 font-medium">
                            {session?.user?.name ?? session?.user?.email}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-2 text-sm font-medium ${statusColor}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${status === "connected" ? "bg-emerald-400 animate-pulse" :
                                status === "connecting" ? "bg-yellow-400 animate-pulse" : "bg-red-400"
                            }`} />
                        {statusLabel}
                    </span>
                    {status === "connected" ? (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={resync} className="gap-2">
                                <RefreshCw className="h-4 w-4" /> Resync
                            </Button>
                            <Button variant="outline" size="sm" onClick={disconnect} className="gap-2">
                                <BluetoothOff className="h-4 w-4" /> Disconnect
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            onClick={connect}
                            disabled={status === "connecting"}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Bluetooth className="h-4 w-4" />
                            {status === "connecting" ? "Connecting…" : "Connect Wallet"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Financial Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {walletData ? (
                    <>
                        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-emerald-500" /> All-Time Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{walletData.balance.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-sky-500/20 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-sky-500" /> This Month Income
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                                    ₹{walletData.income.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-rose-500" /> This Month Expenses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                                    ₹{walletData.expense.toLocaleString()}
                                </p>
                                {walletData.warning && (
                                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                        <ShieldAlert className="h-3 w-3" /> {walletData.warning}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-violet-500" /> Savings Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                                    {walletData.savings_pct.toFixed(1)}%
                                </p>
                                <div className="mt-2 h-2 rounded-full bg-violet-100 dark:bg-violet-900">
                                    <div
                                        className="h-2 rounded-full bg-violet-500 transition-all"
                                        style={{ width: `${Math.min(walletData.savings_pct, 100)}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-500" /> Top Spending
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-mono text-amber-700 dark:text-amber-300 break-words">
                                    {walletData.top_cat || "No data"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">This month</p>
                            </CardContent>
                        </Card>

                        <Card className={walletData.income - walletData.expense >= 0 ? "border-emerald-500/20" : "border-red-500/20"}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Net This Month</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className={`text-3xl font-bold ${walletData.income - walletData.expense >= 0
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-red-500"
                                    }`}>
                                    ₹{(walletData.income - walletData.expense).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="col-span-3 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Bluetooth className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm">Connect your wallet to see live financial data</p>
                        </CardContent>
                    </Card>
                )}

                {/* Sync Log */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" /> Sync Log
                        </CardTitle>
                        <CardDescription>Last 10 sync events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {syncLog.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No events yet. Connect to start.</p>
                        ) : (
                            <ul className="space-y-1">
                                {syncLog.map((line, i) => (
                                    <li key={i} className={`text-xs font-mono px-2 py-1 rounded ${line.includes("✓")
                                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                                            : line.includes("📍") || line.includes("location")
                                                ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
                                                : line.includes("✗")
                                                    ? "text-red-500 bg-red-50 dark:bg-red-950/30"
                                                    : "text-muted-foreground bg-muted/50"
                                        }`}>
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Last Known Location */}
                <Card className="border-amber-500/20">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-amber-500" /> Last Known Location
                        </CardTitle>
                        <CardDescription>Saved automatically on disconnect</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {locationError && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> {locationError}
                            </p>
                        )}
                        {lastLocation ? (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-foreground">
                                    {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
                                </p>
                                {lastLocation.address && (
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {lastLocation.address}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Saved: {new Date(lastLocation.savedAt).toLocaleString()}
                                </p>
                                <a
                                    href={`https://www.google.com/maps?q=${lastLocation.lat},${lastLocation.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    <MapPin className="h-3 w-3" /> Open in Google Maps
                                </a>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-4 text-muted-foreground">
                                <MapPin className="h-8 w-8 mb-2 opacity-30" />
                                <p className="text-xs">No location saved yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Setup Guide */}
            <Card className="border-indigo-500/20">
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-500" /> ESP32 Setup
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>1. Flash <code className="bg-muted px-1 rounded text-xs">arduino/smart_wallet.ino</code> to your ESP32</p>
                    <p>2. Wire: <code className="bg-muted px-1 rounded text-xs">VDD→3V3  GND→GND  SCK→22  SDA→21</code></p>
                    <p>3. Use <strong>Chrome or Edge</strong> (Web Bluetooth not supported in Firefox/Safari)</p>
                    <p>4. Sign in, then click <strong>Connect Wallet</strong></p>
                </CardContent>
            </Card>
        </div>
    );
}
