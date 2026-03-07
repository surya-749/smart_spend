"use client";

import { SessionProvider } from "next-auth/react";
import { BLEProvider } from "@/components/BLEProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <BLEProvider>
                {children}
            </BLEProvider>
        </SessionProvider>
    );
}
