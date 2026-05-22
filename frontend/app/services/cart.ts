import api from "../lib/axios";
import { AddItemDto, UpdateItemDto } from "../types";

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const addItemToCart = async (addItemDto: AddItemDto) => {
  const res = await api.post("/cart/items", addItemDto);
  return res.data;
};

export const updateQuantity = async (
  itemId: string,
  updateItemDto: UpdateItemDto,
) => {
  const res = await api.patch(`/cart/items/${itemId}`, updateItemDto);

  return res.data;
};

export const deleteItemFromCart = async (itemId: string) => {
  const res = await api.delete(`/cart/items/${itemId}`);

  return res.data;
};
