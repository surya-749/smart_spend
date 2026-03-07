"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow, addHours, isAfter } from "date-fns"
import { Loader2, Trash2, ShoppingCart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WishlistItem {
    id: string
    amount: number
    category: string
    description: string | null
    createdAt: string
    coolDownHours: number
}

interface WishlistItemCardProps {
    item: WishlistItem
    onDelete?: (id: string) => void
    onConvert?: (id: string) => void
}

function WishlistItemCard({ item, onDelete, onConvert }: WishlistItemCardProps) {
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [isAvailable, setIsAvailable] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        const availableDate = addHours(new Date(item.createdAt), item.coolDownHours)

        const tick = () => {
            const now = new Date()
            if (isAfter(now, availableDate)) {
                setIsAvailable(true)
                setTimeLeft("Ready to buy")
            } else {
                setIsAvailable(false)
                // Manual formatting for countdown could be better, but formatDistanceToNow is easy
                setTimeLeft(`Available ${formatDistanceToNow(availableDate, { addSuffix: true })}`)
            }
        }

        tick()
        const interval = setInterval(tick, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [item])

    const handleConvert = async () => {
        if (!confirm("Are you sure you want to buy this now?")) return
        setIsProcessing(true)
        try {
            if (onConvert) onConvert(item.id)
        } catch (e) {
            console.error(e)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Delete this item?")) return
        setIsProcessing(true)
        try {
            if (onDelete) onDelete(item.id)
        } catch (e) {
            console.error(e)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="p-4 border rounded-lg flex items-center justify-between bg-card">
            <div>
                <div className="font-semibold text-lg">{item.description || item.category}</div>
                <div className="text-muted-foreground text-sm">{item.category}</div>
                <div className="font-bold mt-1 text-primary">₹{item.amount.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeLeft}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Button
                    size="sm"
                    variant={isAvailable ? "default" : "secondary"}
                    disabled={!isAvailable || isProcessing}
                    onClick={handleConvert}
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-1" />}
                    Buy Now
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={isProcessing}
                    onClick={handleDelete}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

export function WishlistList({ items, onDelete, onConvert }: { 
    items: WishlistItem[]
    onDelete?: (id: string) => void
    onConvert?: (id: string) => void 
}) {
    if (items.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No items in cool down.</div>
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <WishlistItemCard 
                    key={item.id} 
                    item={item} 
                    onDelete={onDelete}
                    onConvert={onConvert}
                />
            ))}
        </div>
    )
}
