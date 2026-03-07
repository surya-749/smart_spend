import { TransactionForm } from "@/components/Log/TransactionForm";

export default function LogPage() {
    return (
        <div className="p-8 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Daily Log</h2>
            <TransactionForm />
        </div>
    );
}
