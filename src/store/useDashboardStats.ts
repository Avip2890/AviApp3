import { useEffect, useState } from "react";
import {
    MenuItemApi,
    OrderApi,
    UserApi,
    OrderDto,
    MenuItemDto,
} from "../open-api";

interface DashboardStats {
    orderCount: number;
    menuItemCount: number;
    userCount: number;
    monthlyIncome: number;
    loadingStats: boolean;
    errorStats: string | null;
}

export const useDashboardStats = (): DashboardStats => {
    const [orderCount, setOrderCount] = useState<number>(0);
    const [menuItemCount, setMenuItemCount] = useState<number>(0);
    const [userCount, setUserCount] = useState<number>(0);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [loadingStats, setLoadingStats] = useState<boolean>(true);
    const [errorStats, setErrorStats] = useState<string | null>(null);

    const getToken = (): string => localStorage.getItem("token") ?? "";

    const calculateMonthlyIncome = (
        orders: OrderDto[],
        menuItems: MenuItemDto[]
    ): number => {
        return orders.reduce((total, order) => {
            if (!order.menuItemName) return total;

            const itemNames = order.menuItemName
                .split(",")
                .map(name => name.trim());

            const orderTotal = itemNames.reduce((sum, name) => {
                const item = menuItems.find(m => m.name === name);
                return sum + (item?.price ?? 0);
            }, 0);

            return total + orderTotal;
        }, 0);
    };

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            const token = getToken();

            const orderApi = new OrderApi();
            const menuItemApi = new MenuItemApi();
            const userApi = new UserApi();

            try {
                const [ordersRes, menuItemsRes, usersRes] = await Promise.all([
                    orderApi.getOrders({ headers: { Authorization: `Bearer ${token}` } }),
                    menuItemApi.getMenuItems(),
                    userApi.getUsers({ headers: { Authorization: `Bearer ${token}` } })
                ]);

                const orders = ordersRes.data ?? [];
                const menuItems = menuItemsRes.data ?? [];
                const users = usersRes.data ?? [];

                setOrderCount(orders.length);
                setMenuItemCount(menuItems.length);
                setUserCount(users.length);

                const income = calculateMonthlyIncome(orders, menuItems);
                setMonthlyIncome(income);
            } catch (err) {
                console.error("❌ שגיאה בטעינת סטטיסטיקות:", err);
                setErrorStats("לא ניתן לטעון סטטיסטיקות.");
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    return {
        orderCount,
        menuItemCount,
        userCount,
        monthlyIncome,
        loadingStats,
        errorStats
    };
};
