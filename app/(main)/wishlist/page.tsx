"use client"

import { WishlistForm } from "@/components/Wishlist/WishlistForm"
import { WishlistList } from "@/components/Wishlist/WishlistList"
import { useWishlist } from "@/lib/hooks"

export default function WishlistPage() {
    const { items, loading, refresh, addWishlistItem, deleteWishlistItem, convertToTransaction } = useWishlist()

    if (loading) {
        return <div className="p-6">Loading wishlist...</div>
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Cool Down Wishlist</h1>
            <p className="text-muted-foreground">Avoid impulse buys. Add items here and wait for the cool down period.</p>

            <div className="grid md:grid-cols-[350px,1fr] gap-6">
                <div>
                    <WishlistForm onAdd={(data) => { addWishlistItem(data); refresh(); }} />
                </div>
                <div>
                    <WishlistList 
                        items={items} 
                        onDelete={(id) => { deleteWishlistItem(id); refresh(); }}
                        onConvert={(id) => { convertToTransaction(id); refresh(); }}
                    />
                </div>
            </div>
        </div>
    )
}
