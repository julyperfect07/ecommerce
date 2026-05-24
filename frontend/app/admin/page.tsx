"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "@/app/services/products";
import { getOrders, updateOrderStatus } from "@/app/services/orders";
import useAuthStore from "@/app/store/auth.store";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  Trash2,
  Edit,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from "next/image";
import { Order, Product, OrderStatus } from "@/app/types";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  SHIPPED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const AdminPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      toast.error("Access denied!");
      router.push("/");
    }
  }, [user]);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProducts({ limit: 100 }),
    enabled: user?.role === "ADMIN",
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getOrders,
    enabled: user?.role === "ADMIN",
  });

  const products: Product[] = productsData?.products || [];
  const orders: Order[] = ordersData?.orders || [];

  const { mutate: handleDelete } = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const { mutate: handleStatusUpdate } = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update order status"),
  });

  if (!user || user.role !== "ADMIN") return null;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">Manage your store</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          {
            title: "Total Products",
            value: productsData?.total || 0,
            icon: Package,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            title: "Total Orders",
            value: orders.length,
            icon: ShoppingBag,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border bg-card p-6 flex items-center gap-4"
          >
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">{stat.title}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 text-base font-medium border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-purple-500 text-purple-500"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 text-base font-medium border-b-2 transition-colors ${
            activeTab === "orders"
              ? "border-purple-500 text-purple-500"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Orders
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">All Products</h2>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push("/admin/products/create")}
            >
              + Add Product
            </Button>
          </div>

          {productsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No products yet
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-purple-500 font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.stock} in stock
                      </span>
                      {product.stock === 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/admin/products/${product.id}/edit`)
                      }
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    {/* Confirm Delete Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{product.name}</strong>? This action cannot
                            be undone and will also remove the image from
                            Cloudinary.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDelete(product.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-bold mb-4">All Orders</h2>

          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No orders yet
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all"
                >
                  {/* Order Info */}
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-purple-500 font-bold mt-1">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>

                  {/* Items count */}
                  <div className="text-sm text-muted-foreground">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </div>

                  {/* Status + Update */}
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${statusColors[order.status]} text-sm px-3 py-1`}
                    >
                      {order.status}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          Update <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(
                          [
                            "PENDING",
                            "PROCESSING",
                            "SHIPPED",
                            "DELIVERED",
                            "CANCELLED",
                          ] as OrderStatus[]
                        ).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() =>
                              handleStatusUpdate({ orderId: order.id, status })
                            }
                            className={
                              order.status === status ? "font-bold" : ""
                            }
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </main>
  );
};

export default AdminPage;
