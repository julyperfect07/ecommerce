"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/app/services/orders";
import useAuthStore from "@/app/store/auth.store";
import { motion } from "framer-motion";
import { Package, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@/app/types";
import Image from "next/image";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  SHIPPED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusIcons: Record<string, string> = {
  PENDING: "⏳",
  PROCESSING: "⚙️",
  SHIPPED: "🚚",
  DELIVERED: "✅",
  CANCELLED: "❌",
};

const OrdersPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: isAuthenticated,
  });

  const orders: Order[] = data?.orders || [];

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-base font-medium">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            My Orders
          </h1>
        </div>
        <p className="text-muted-foreground text-lg mt-2">
          {orders.length} order{orders.length !== 1 ? "s" : ""} total
        </p>
      </motion.div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-3">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <Skeleton className="w-16 h-16 rounded-xl" />
                <Skeleton className="w-16 h-16 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <Package className="w-20 h-20 text-muted-foreground/30 mb-6" />
          <h2 className="text-2xl font-bold mb-3">No orders yet</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Start shopping to see your orders here!
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Start Shopping
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border bg-card p-6 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono text-sm font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className={`${statusColors[order.status]} text-sm px-3 py-1`}
                  >
                    {statusIcons[order.status]} {order.status}
                  </Badge>
                </div>
              </div>

              {/* Order Date + Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xl font-bold text-purple-500">
                  ${order.total.toFixed(2)}
                </p>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {order.items.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      {/* Quantity badge */}
                      {item.quantity > 1 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      )}
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-popover border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                          {item.product.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
};

export default OrdersPage;
