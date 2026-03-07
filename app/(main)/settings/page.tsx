"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAllData } from "@/lib/localStorage";

export default function SettingsPage() {
    const [clearing, setClearing] = useState(false);
    const router = useRouter();

    const handleClearData = async () => {
        if (!confirm("Are you sure you want to delete ALL your transaction history? This action cannot be undone.")) {
            return;
        }

        setClearing(true);
        try {
            clearAllData();
            alert("All data cleared successfully.");
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

            <Card>
                <CardHeader>
                    <CardTitle>App Information</CardTitle>
                    <CardDescription>Smart Spend - Personal Finance Manager</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        All your data is stored locally in your browser. No account or login required.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    </div>
                    <CardDescription className="text-red-600/80">
                        Irreversible actions that affect your data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-red-900 dark:text-red-200">Clear All User Data</h4>
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Permanently delete all transaction history and logs associated with this account.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={handleClearData}
                            disabled={clearing}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {clearing ? "Clearing..." : "Clear Data"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
