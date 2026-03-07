import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface SummaryCardsProps {
    stats: {
        totalBalance: number;
        monthlyIncome: number;
        monthlyExpenses: number;
        monthlySavings: number;
    }
}

export function SummaryCards({ stats }: SummaryCardsProps) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
    });

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatter.format(stats.totalBalance)}</div>
                    <p className="text-xs text-muted-foreground">
                        Current available funds
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">{formatter.format(stats.monthlyIncome)}</div>
                    <p className="text-xs text-muted-foreground">
                        +12% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatter.format(stats.monthlyExpenses)}</div>
                    <p className="text-xs text-muted-foreground">
                        +4% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
                    <PiggyBank className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatter.format(stats.monthlySavings)}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.monthlySavings >= 0 ? "+ saved this month" : "- overspent this month"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
