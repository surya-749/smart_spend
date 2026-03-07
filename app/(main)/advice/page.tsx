"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, TrendingUp, Loader2 } from "lucide-react";
// import ReactMarkdown from 'react-markdown'; // If you want markdown rendering, otherwise plain text for now or simple split

export default function AdvicePage() {
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateAdvice = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/ai/insights", {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch insights");
            }

            const data = await res.json();
            setAdvice(data.advice);
        } catch (err) {
            console.error(err);
            setError("Failed to generate advice. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Smart Advisor</h2>
                <Button onClick={generateAdvice} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate New Report
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2 border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Sparkles className="h-6 w-6 text-indigo-500" />
                            <CardTitle>AI Insights</CardTitle>
                        </div>
                        <CardDescription>
                            Personalized financial advice based on your spending habits.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {!advice && !loading && !error && (
                            <div className="text-center py-10 text-slate-500">
                                Click "Generate New Report" to get personalized financial advice.
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-4">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
                            </div>
                        )}

                        {advice && (
                            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                <div className="whitespace-pre-wrap">{advice}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Brain className="mr-2 h-4 w-4" /> Financial Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-6">
                            <div className="text-5xl font-bold text-emerald-500 mb-2">--</div>
                            <p className="text-sm font-medium text-slate-500">Health Score</p>
                            <p className="text-xs text-slate-400 mt-4">Generate report to update</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-4 w-4" /> Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!advice ? (
                            <p className="text-sm text-slate-500">Generate a report to see recommended actions.</p>
                        ) : (
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <li>Review your recent high priority expenses.</li>
                                <li>Check if there are subscriptions you can cancel.</li>
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
