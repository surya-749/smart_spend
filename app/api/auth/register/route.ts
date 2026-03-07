import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body as {
            name: string;
            email: string;
            password: string;
        };

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Check if email is already taken
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name: name || email.split("@")[0],
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
    } catch (err: any) {
        console.error("[Register Error]", err?.message);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}
