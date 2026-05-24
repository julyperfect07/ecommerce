"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  updateQuantity,
  deleteItemFromCart,
} from "@/app/services/cart";
import { checkout } from "@/app/services/orders";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import useAuthStore from "@/app/store/auth.store";
import { useRouter } from "next/navigation";

const CartSheet = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 👇 always fetch when authenticated so badge count is always correct
  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated,
  });

  const cart = data?.cart;
  const items = cart?.items || [];
  const total = items.reduce((sum: number, item: any) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const totalItems = items.reduce((sum: number, item: any) => {
    return sum + item.quantity;
  }, 0);

  const { mutate: update } = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateQuantity(itemId, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to update quantity"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (itemId: string) => deleteItemFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
    onError: () => toast.error("Failed to remove item"),
  });

  const { mutate: checkoutCart, isPending: isCheckingOut } = useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed successfully! 🎉");
      setOpen(false);
      router.push("/orders");
    },
    onError: () => toast.error("Failed to place order. Please try again"),
  });

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to view your cart! 🔐");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }
    setOpen(true);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10"
          onClick={handleCartClick}
        >
          <ShoppingCart className="w-6 h-6" />
          {/* 👇 badge always shows correct count */}
          {isAuthenticated && totalItems > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-purple-500" />
            Your Cart
            {items.length > 0 && (
              <span className="text-base font-normal text-muted-foreground">
                ({items.length} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <PackageOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add some products to get started!
              </p>
              <Button
                onClick={() => setOpen(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue Shopping
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {items.map((item: any) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 p-3 rounded-xl border bg-card"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base leading-tight line-clamp-2 mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-purple-500 font-bold text-base mb-3">
                        ${item.product.price.toFixed(2)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border rounded-lg p-0.5">
                          <button
                            onClick={() =>
                              update({ itemId: item.id, quantity: -1 })
                            }
                            className="w-7 h-7 rounded-md hover:bg-muted transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              update({ itemId: item.id, quantity: 1 })
                            }
                            className="w-7 h-7 rounded-md hover:bg-muted transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => remove(item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="text-green-500">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-purple-500">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base bg-purple-600 hover:bg-purple-700"
              disabled={isCheckingOut}
              onClick={() => checkoutCart()}
            >
              {isCheckingOut ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Checkout →"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
