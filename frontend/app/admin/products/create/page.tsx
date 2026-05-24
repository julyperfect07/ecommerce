"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/app/services/products";
import useAuthStore from "@/app/store/auth.store";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

const CreateProductPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  if (!user || user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const { mutate: handleCreate, isPending } = useMutation({
    mutationFn: () =>
      createProduct(
        {
          name,
          description,
          price: Number(price),
          stock: Number(stock),
        },
        file || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully! 🎉");
      router.push("/admin");
    },
    onError: () => toast.error("Failed to create product"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected)); // 👈 show preview
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (Number(price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (Number(stock) < 0) {
      toast.error("Stock cannot be negative");
      return;
    }
    handleCreate();
  };

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-base font-medium">Back to Dashboard</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-500" />
              Create New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-base">Product Image</Label>
                <div
                  className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  {preview ? (
                    <div className="relative h-56">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-medium">
                          Click to change
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-56 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Upload className="w-10 h-10" />
                      <p className="text-base font-medium">
                        Click to upload image
                      </p>
                      <p className="text-sm">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Nike Air Max 90"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 text-base"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Describe your product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-base outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base">
                    Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-11 text-base"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-base">
                    Stock <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="h-11 text-base"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-base bg-purple-600 hover:bg-purple-700"
                disabled={isPending}
              >
                {isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Create Product"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
};

export default CreateProductPage;
