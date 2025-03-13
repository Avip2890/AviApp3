export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface CustomerDto {
    id?: number;
    customerName?: string;
    phone?: string;
}

export interface MenuItemDto {
    id?: number;
    name?: string;
    description?: string;
    price: number;
    isAvailable: boolean;
}

export interface OrderMenuItemDto {
    orderId: number;
    menuItemId: number;
}

export interface OrderDto {
    id?: number;
    orderDate: string;
    customerId: number;
    customerName : string;
    phone:string;
    orderMenuItems?: OrderMenuItemDto[];
}

export interface RoleDto {
    id?: number;
    roleName: string;
}

export interface UserDto {
    id?: number;
    Name: string;
    password: string;
    email: string;
    createdAt?: string;
    roles?: { name:string  }[];
}
