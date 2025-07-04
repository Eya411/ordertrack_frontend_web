export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role?: string;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
        access_token: string;
        token_type: string;
        role: string;
    };
}


export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}