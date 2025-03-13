import {OrderDto} from "../Types/apiTypes.ts";
import apiClient from "../ApiClient.ts";


export const getOrders = async () => {
    const response = await apiClient.get("/orders");
    return response.data;
};

export const getOrderById = async (id: number) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
};

export const createOrder = async (data: OrderDto) => {
    const response = await apiClient.post("/create-orders", data);
    return response.data;
};

export const updateOrder = async (id: number, data: OrderDto) => {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response.data;
};

export const deleteOrder = async (id: number) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
};
