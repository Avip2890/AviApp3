export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: {
        id: number;
        email: string;
        roles: string[];
    };
    message?: string;
}
