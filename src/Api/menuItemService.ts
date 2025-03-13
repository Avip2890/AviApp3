import apiClient from "../ApiClient.ts";
import {MenuItemDto} from "../Types/apiTypes.ts";


export const getMenuItems = async () => {
    const response = await apiClient.get("/menuitems");
    return response.data;
};

export const getMenuItemById = async (id: number) => {
    const response = await apiClient.get(`/menuitems/${id}`);
    return response.data;
};

export const createMenuItem = async (data: MenuItemDto) => {
    const response = await apiClient.post("/menuitems", data);
    return response.data;
};

export const updateMenuItem = async (id: number, data: MenuItemDto) => {
    const response = await apiClient.put(`/menuitems/${id}`, data);
    return response.data;
};

export const deleteMenuItem = async (id: number) => {
    const response = await apiClient.delete(`/menuitems/${id}`);
    return response.data;
};
