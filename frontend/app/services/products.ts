import api from "../lib/axios";
import { ProductQueryParams } from "../types";

interface ProductBody {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export const getProducts = async (params?: ProductQueryParams) => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const getProductById = async (id: string) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (body: ProductBody, file?: File) => {
  const formData = new FormData();
  formData.append("name", body.name);
  formData.append("price", body.price.toString());
  formData.append("stock", body.stock.toString());
  if (body.description) formData.append("description", body.description);
  if (file) formData.append("file", file);

  const res = await api.post("/products", formData);
  return res.data;
};

export const updateProduct = async (
  productId: string,
  body: ProductBody,
  file?: File,
) => {
  const formData = new FormData();
  if (body.name) formData.append("name", body.name);
  if (body.price) formData.append("price", body.price.toString());
  if (body.stock) formData.append("stock", body.stock.toString());
  if (body.description) formData.append("description", body.description);
  if (file) formData.append("file", file);

  const res = await api.patch(`/products/${productId}`, formData);
  return res.data;
};

export const deleteProduct = async (productId: string) => {
  const res = await api.delete(`/products/${productId}`);
  return res.data;
};
