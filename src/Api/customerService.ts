import apiClient from "../ApiClient.ts";
import {CustomerDto} from "../Types/apiTypes.ts";


export const getCustomers = async () => {
    const response = await apiClient.get("/customers");
    return response.data;
};

export const getCustomerById = async (id: number) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
};

export const createCustomer = async (data: CustomerDto) => {
    const response = await apiClient.post("/customers", data);
    return response.data;
};

export const updateCustomer = async (id: number, data: CustomerDto) => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id: number) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
};
