import apiClient from "../ApiClient.ts";
import {RoleDto} from "../Types/apiTypes.ts";

export const getRoles = async () => {
    const response = await apiClient.get("/roles");
    return response.data;
};

export const createRole = async (data: RoleDto) => {
    const response = await apiClient.post("/roles", data);
    return response.data;
};
