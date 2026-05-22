import api from "../lib/axios";
import { UpdateOrderDto } from "../types";

export const checkout = async () => {
  const res = await api.post("/orders/checkout");
  return res.data;
};

export const getOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};

export const getOrder = async (orderId: string) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

export const updateOrderStatus = async (
  orderId: string,
  updateOrderDto: UpdateOrderDto,
) => {
  const res = await api.patch(`/orders/${orderId}/status`, updateOrderDto);

  return res.data;
};
