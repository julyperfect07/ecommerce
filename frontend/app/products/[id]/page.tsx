"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProductById } from "@/app/services/products";
import { addItemToCart } from "@/app/services/cart";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import useAuthStore from "@/app/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";

const ProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
  });

  const product = data?.product;

  const { mutate: addToCart, isPending } = useMutation({
    mutationFn: () => addItemToCart({ productId: id as string, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${product?.name} added to cart! 🛒`);
    },
    onError: () => {
      toast.error("Failed to add to cart. Please try again");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart! 🔐");
      setTimeout(() => router.push("/login"), 1500); // 👈 wait for toast then redirect
      return;
    }
    addToCart();
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Skeleton className="h-8 w-24 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <Skeleton className="h-96 md:h-125 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="w-20 h-20 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="mt-4"
        >
          Back to Home
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-base font-medium">Back</span>
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        {/* Left - Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden bg-muted"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-24 h-24 text-muted-foreground/20" />
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg px-6 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Right - Details */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          {/* Name */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {product.name}
            </h1>

            {product.stock > 0 ? (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-sm px-3 py-1">
                ✓ In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                Out of Stock
              </Badge>
            )}

            {product.stock > 0 && product.stock <= 5 && (
              <Badge className="ml-2 bg-orange-500 text-white text-sm px-3 py-1">
                Only {product.stock} left!
              </Badge>
            )}
          </div>

          {/* Price */}
          <p className="text-4xl md:text-5xl font-bold text-purple-500">
            ${product.price.toFixed(2)}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground text-lg leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="font-medium text-base">Quantity:</span>
              <div className="flex items-center gap-3 border rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-lg font-bold"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="w-9 h-9 rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700"
              disabled={product.stock === 0 || isPending}
              onClick={handleAddToCart}
            >
              {isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 text-lg"
              onClick={() => router.push("/")}
            >
              Continue Shopping
            </Button>
          </div>

          {/* Extra info */}
          <div className="border-t pt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-5 h-5" />
              <span className="text-sm">Free delivery</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="w-5 h-5" />
              <span className="text-sm">Top rated</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default ProductPage;
