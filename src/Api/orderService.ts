import {OrderDto} from "../Types/apiTypes.ts";
import apiClient from "../ApiClient.ts";


export const getOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {

        throw new Error("User is not authenticated");
    }

    const response = await apiClient.get("/orders", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

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
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("User is not authenticated");
    }

    console.log(`📡 שולח עדכון הזמנה ID:${id} עם הטוקן: ${token}`);

    const response = await apiClient.put(`/orders/${id}`, data, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    return response.data;
};


export const deleteOrder = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("User is not authenticated");
    }

    const response = await apiClient.delete(`/orders/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    return response.data;
};
