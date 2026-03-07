"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const CATEGORIES = [
    "Tech",
    "Clothing",
    "Home",
    "Entertainment",
    "Travel",
    "Other",
]

interface WishlistFormProps {
    onAdd?: (data: {
        amount: number;
        category: string;
        description?: string;
        coolDownHours?: number;
    }) => void;
}

export function WishlistForm({ onAdd }: WishlistFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        description: "",
        coolDownHours: "24",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (onAdd) {
                onAdd({
                    amount: parseFloat(formData.amount),
                    category: formData.category,
                    description: formData.description || undefined,
                    coolDownHours: parseInt(formData.coolDownHours),
                })
            }

            setFormData({
                amount: "",
                category: "",
                description: "",
                coolDownHours: "24",
            })
        } catch (error) {
            console.error("Failed to create item", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
            <h3 className="font-semibold text-lg">Add to Cool Down</h3>
            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    placeholder="What do you want to buy?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="coolDown">Cool Down (Hours)</Label>
                <Select
                    value={formData.coolDownHours}
                    onValueChange={(value) => setFormData({ ...formData, coolDownHours: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="24">24 Hours</SelectItem>
                        <SelectItem value="48">48 Hours</SelectItem>
                        <SelectItem value="72">3 Days</SelectItem>
                        <SelectItem value="168">1 Week</SelectItem>
                        <SelectItem value="0">Test (Instant)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Wishlist
            </Button>
        </form>
    )
}
