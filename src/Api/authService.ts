import { LoginRequestDto } from "../Types/apiTypes.ts";
import apiClient from "../ApiClient.ts";
import { LoginResponse } from "../Interfaces/LoginResponseInterface.ts";

export const login = async (data: LoginRequestDto): Promise<LoginResponse> => {
    console.log("🔹 שליחת בקשת התחברות:", data);

    try {
        const response = await apiClient.post("/login", data);

        console.log("✅ תגובת השרת (לפני תנאי הבדיקה):", response.data);


        if (!response.data) {
            console.error("❌ שגיאה: התגובה מהשרת ריקה!");
            return { success: false, message: "Login failed. Server response is empty." };
        }

        if (!response.data.token || !response.data.user) {
            console.warn("⚠️ השרת החזיר תגובה אך אין טוקן או משתמש!", response.data);
            return { success: false, message: response.data?.message || "Login failed. No token received." };
        }

        return {
            success: true,
            token: response.data.token,
            user: response.data.user,
        };
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials.";
        console.error("❌ שגיאה בהתחברות:", errMessage);
        return { success: false, message: errMessage };
    }
};
