import apiClient from "../ApiClient.ts";
import {UserDto} from "../Types/apiTypes.ts";


export const getUsers = async () => {
    const response = await apiClient.get("/users");
    return response.data;
};

export const getUserById = async (id: number) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (data: UserDto) => {
    const response = await apiClient.post("/users", data);
    return response.data;
};

export const updateUser = async (id: number, data: UserDto) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: number) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
};
