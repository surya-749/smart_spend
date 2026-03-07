"use client";

import { SummaryCards } from "@/components/Dashboard/SummaryCards";
import { SpendingChart } from "@/components/Dashboard/SpendingChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTransactions, useStats } from "@/lib/hooks";

export default function Dashboard() {
    const { transactions, loading: transLoading } = useTransactions();
    const { stats, loading: statsLoading } = useStats();

    const loading = transLoading || statsLoading;

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/log">
                        <Button>+ Log Transaction</Button>
                    </Link>
                </div>
            </div>

            <SummaryCards stats={stats} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <SpendingChart data={stats.monthlyStats} />
                </div>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {transactions.slice(0, 5).map((t) => (
                                <div key={t.id} className="flex items-center">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {t.type === 'income' ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{t.category}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t.description || "No description"}
                                        </p>
                                    </div>
                                    <div className={`ml-auto font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground p-4">
                                    No recent transactions found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
