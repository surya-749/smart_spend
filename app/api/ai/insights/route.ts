import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    if (!userId) {
        return NextResponse.json({ error: "User ID not found in session" }, { status: 401 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "GROQ_API_KEY is not configured on the server" }, { status: 500 });
    }

    try {
        // 1. Fetch this month's transactions
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: startOfMonth },
            },
            orderBy: { date: "desc" },
            take: 50,
        });

        // 2. Guard: if no transactions, return friendly message without calling Groq
        if (transactions.length === 0) {
            return NextResponse.json({
                advice: "## No Transactions This Month\n\nYou have no recorded transactions for this month yet. Start logging your income and expenses to get personalized AI-powered financial insights!",
            });
        }

        // 3. Build summary data
        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((acc, t) => acc + t.amount, 0);

        const expense = transactions
            .filter((t) => t.type === "expense")
            .reduce((acc, t) => acc + t.amount, 0);

        const categoryBreakdown: Record<string, number> = {};
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
            });

        const topCategories = Object.entries(categoryBreakdown)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cat, amount]) => `${cat}: ₹${amount.toFixed(2)}`)
            .join(", ");

        const savings = income - expense;
        const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : "0";

        // 4. Construct prompt
        const prompt = `You are a financial advisor. Analyze this user's spending for the current month:

- Total Income: ₹${income.toFixed(2)}
- Total Expenses: ₹${expense.toFixed(2)}
- Net Savings: ₹${savings.toFixed(2)} (${savingsRate}% savings rate)
- Top Expense Categories: ${topCategories || "None recorded"}
- Total Transactions: ${transactions.length}

Provide exactly 3 distinct, actionable, and specific pieces of financial advice based on this data. 
Focus on savings opportunities, budget adjustments, or positive reinforcement if they are doing well.
Format as Markdown bullet points. Be specific and use the actual numbers provided.`;

        // 5. Call Groq API
        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a concise, helpful financial advisor. Respond with exactly 3 bullet points of advice." },
                { role: "user", content: prompt },
            ],
            max_tokens: 512,
            temperature: 0.7,
        });

        const text = completion.choices?.[0]?.message?.content;

        if (!text) {
            return NextResponse.json(
                { error: "The AI returned an empty response. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({ advice: text });

    } catch (error: any) {
        console.error("[AI Insights Error]", error?.message ?? error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate insights. Please try again." },
            { status: 500 }
        );
    }
}
