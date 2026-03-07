"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface SpendingChartProps {
    data: any[];
}

export function SpendingChart({ data }: SpendingChartProps) {
    // Mock data if empty for visualization
    const chartData = data && data.length > 0 ? data : [
        { name: 'Week 1', income: 4000, expense: 2400 },
        { name: 'Week 2', income: 3000, expense: 1398 },
        { name: 'Week 3', income: 2000, expense: 3800 },
        { name: 'Week 4', income: 2780, expense: 3908 },
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${value}`} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="income" fill="#4ade80" name="Income" />
                            <Bar dataKey="expense" fill="#f87171" name="Expense" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
