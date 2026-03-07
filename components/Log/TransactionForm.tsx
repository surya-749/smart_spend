"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const EXPENSE_CATEGORIES = [
    "Food", "Transport", "Housing", "Utilities",
    "Entertainment", "Health", "Personal", "Other",
];

const INCOME_CATEGORIES = [
    "Salary", "Freelance", "Investment", "Gift", "Other",
];

export function TransactionForm() {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [formData, setFormData] = useState({
        amount: "",
        type: "expense",
        category: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categorySelectValue, setCategorySelectValue] = useState("");

    // Reset category when type changes
    useEffect(() => {
        setCategorySelectValue("");
        setFormData(prev => ({ ...prev, category: "" }));
    }, [formData.type]);

    const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setCategorySelectValue(val);
        setFormData(prev => ({ ...prev, category: val !== "Other" ? val : "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            const finalDate = date
                ? format(date, "yyyy-MM-dd")
                : new Date().toISOString().split("T")[0];

            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    type: formData.type,
                    category: formData.category,
                    description: formData.description || undefined,
                    date: finalDate,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? `Server error ${res.status}`);
            }

            // Reset form
            setFormData({ amount: "", type: "expense", category: "", description: "" });
            setCategorySelectValue("");
            setDate(new Date());
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

        } catch (err: any) {
            setError(err?.message ?? "Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };

    const categories = formData.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    return (
        <Card className="max-w-xl mx-auto">
            <CardHeader>
                <CardTitle>Log Transaction</CardTitle>
                <CardDescription>Record your daily income or expenses.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Success Banner */}
                {success && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        Transaction saved successfully!
                    </div>
                )}
                {/* Error Banner */}
                {error && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "expense" })}
                                className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${formData.type === "expense"
                                    ? "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                                    : "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "income" })}
                                className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${formData.type === "income"
                                    ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                    : "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    {/* Date picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <div className="space-y-2">
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={categorySelectValue}
                                onChange={handleCategorySelectChange}
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {categorySelectValue === "Other" && (
                                <Input
                                    placeholder="Enter custom category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount (₹)</label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                        <Input
                            placeholder="What was this for?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Saving…" : "Save Transaction"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
