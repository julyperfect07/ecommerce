"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/app/services/products";
import { Product } from "@/app/types";
import { motion } from "framer-motion";
import { ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

const HomePage = () => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  const search = searchParams.get("name") || undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search, minPrice, maxPrice],
    queryFn: () =>
      getProducts({ page, limit: 12, name: search, minPrice, maxPrice }),
  });

  const products: Product[] = data?.products || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12 text-center"
      >
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">
          {search ? (
            <>
              Results for <span className="text-purple-500">"{search}"</span>
            </>
          ) : (
            <>
              Discover <span className="text-purple-500">Amazing</span> Products
            </>
          )}
        </h1>
        <p className="text-muted-foreground text-base md:text-xl">
          {total} products available for you
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-8 md:mb-10 items-start md:items-center p-4 rounded-2xl border bg-muted/30">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Filters:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-20 md:w-auto">
              Min Price
            </span>
            <input
              type="number"
              placeholder="$0"
              value={minPrice || ""}
              onChange={(e) => {
                setMinPrice(
                  e.target.value ? Number(e.target.value) : undefined,
                );
                setPage(1);
              }}
              className="w-full sm:w-28 h-10 px-3 rounded-lg border bg-background text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-20 md:w-auto">
              Max Price
            </span>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice || ""}
              onChange={(e) => {
                setMaxPrice(
                  e.target.value ? Number(e.target.value) : undefined,
                );
                setPage(1);
              }}
              className="w-full sm:w-28 h-10 px-3 rounded-lg border bg-background text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {(minPrice || maxPrice) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMinPrice(undefined);
              setMaxPrice(undefined);
              setPage(1);
            }}
            className="text-red-500 hover:text-red-600 w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card overflow-hidden">
              <Skeleton className="h-48 sm:h-56 md:h-72 w-full" />
              <div className="p-4 md:p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 md:py-32 text-center"
        >
          <Search className="w-16 md:w-20 h-16 md:h-20 text-muted-foreground/30 mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            No products found
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Try adjusting your search or filters
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/products/${product.id}`}>
                <div className="group rounded-2xl border bg-card overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2">
                  {/* Product Image */}
                  <div className="relative bg-muted overflow-hidden w-full aspect-3/2 sm:aspect-4/3 md:aspect-video">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <ShoppingCart className="w-16 h-16 text-muted-foreground/20" />
                      </div>
                    )}

                    {/* Out of stock overlay */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge
                          variant="secondary"
                          className="text-base px-4 py-1"
                        >
                          Out of Stock
                        </Badge>
                      </div>
                    )}

                    {/* Low stock badge */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500 text-white text-xs md:text-sm">
                          Only {product.stock} left!
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 md:p-6 space-y-2 md:space-y-3">
                    <h3 className="font-bold text-lg md:text-xl leading-tight line-clamp-2 group-hover:text-purple-500 transition-colors duration-200">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1 md:pt-2">
                      <p className="text-xl md:text-2xl font-bold text-purple-500">
                        ${product.price.toFixed(2)}
                      </p>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 md:gap-4 mt-12 md:mt-16">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-6 md:px-8"
          >
            Previous
          </Button>
          <span className="text-sm md:text-base text-muted-foreground font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-6 md:px-8"
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
};

export default HomePage;
