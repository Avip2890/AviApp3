import { useEffect, useState } from "react";
import {
    Container, Typography, Paper, CircularProgress, List, ListItem, Divider, Collapse
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { OrderApi, OrderDto, MenuItemApi, MenuItemDto } from "../../open-api";
import "./UserProfile.css";

interface JwtPayloadWithRoles {
    Id: string;
    Email: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
    exp: number;
}

const UserProfile = () => {
    const [user, setUser] = useState<JwtPayloadWithRoles | null>(null);
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const orderApi = new OrderApi();
    const menuItemApi = new MenuItemApi();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decoded = jwtDecode<JwtPayloadWithRoles>(token);
            setUser(decoded);
        } catch (err) {
            console.error("שגיאה בפענוח הטוקן:", err);
        }
    }, [navigate]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const [ordersRes, menuItemsRes] = await Promise.all([
                    orderApi.getOrders(),
                    menuItemApi.getMenuItems()
                ]);

                const allOrders = ordersRes.data as unknown as OrderDto[];
                const allMenuItems = menuItemsRes.data as MenuItemDto[];

                const filtered = allOrders.filter(
                    (o) => o.email?.toLowerCase() === user?.Email.toLowerCase()
                );

                setOrders(filtered);
                setMenuItems(allMenuItems);
            } catch (err) {
                console.error("שגיאה בטעינת נתונים:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.Email) {
            fetchOrders();
        }
    }, [user]);

    const toggleOrderDetails = (orderId: number) => {
        setExpandedOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    if (loading) return <CircularProgress />;

    return (
        <Container className="profile-container">
            <Paper className="profile-card" elevation={3}>
                <Typography variant="h5" className="profile-title">🧑 פרופיל משתמש</Typography>
                <Typography><strong>אימייל:</strong> {user?.Email}</Typography>
                <Typography><strong>מזהה:</strong> {user?.Id}</Typography>
            </Paper>

            <Paper className="orders-card" elevation={3}>
                <Typography variant="h6" className="orders-title">📜 היסטוריית הזמנות</Typography>
                {orders.length === 0 ? (
                    <Typography>לא נמצאו הזמנות.</Typography>
                ) : (
                    <List>
                        {orders.map((order) => (
                            <div key={order.id}>
                                <ListItem className="order-summary" onClick={() => toggleOrderDetails(order.id!)}>
                                    <Typography className="order-number">📦 הזמנה #{order.id}</Typography>
                                    {expandedOrderIds.includes(order.id!)
                                    }
                                </ListItem>

                                <Collapse in={expandedOrderIds.includes(order.id!)} timeout="auto" unmountOnExit>
                                    <div className="order-details">
                                        <Typography>📅 {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "תאריך לא זמין"}</Typography>
                                        <Typography>📞 {order.phone}</Typography>
                                        <Typography>
                                            📋 פריטים:
                                            <ul>
                                                {order.orderMenuItems?.map((omi) => {
                                                    const item = menuItems.find(mi => mi.id === omi.menuItemId);
                                                    return (
                                                        <li key={omi.menuItemId}>
                                                            {item?.name ?? "פריט לא ידוע"} - ₪{item?.price?.toFixed(2) ?? "0.00"}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </Typography>
                                        <Typography>
                                            💰 סה"כ: ₪{
                                            order.orderMenuItems?.reduce((sum, omi) => {
                                                const item = menuItems.find(mi => mi.id === omi.menuItemId);
                                                return sum + (item?.price ?? 0);
                                            }, 0).toFixed(2)
                                        }
                                        </Typography>
                                        <Divider />
                                    </div>
                                </Collapse>
                            </div>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    );
};

export default UserProfile;
