import apiClient from "../ApiClient.ts";
import {MenuItemDto} from "../Types/apiTypes.ts";


export const getMenuItems = async () => {
    const response = await apiClient.get("/menu-items");
    return response.data;
};

export const getMenuItemById = async (id: number) => {
    const response = await apiClient.get(`/menuitems/${id}`);
    return response.data;
};

export const createMenuItem = async (data: MenuItemDto) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("❌ אין טוקן - המשתמש אינו מחובר");
    }

    const response = await apiClient.post("/create-menu-items", data, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

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
