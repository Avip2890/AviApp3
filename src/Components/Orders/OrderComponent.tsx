import { useEffect, useState } from "react";
import {
    Typography, Container, Paper, List, ListItem, ListItemText, CircularProgress,
    Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl,
    InputLabel, Select, MenuItem, SelectChangeEvent
} from "@mui/material";
import { OrderApi, MenuItemApi, OrderDto, MenuItemDto } from "../../open-api";
import "./Order.css";
import * as React from "react";

const Orders = () => {
    const token = localStorage.getItem("token") ?? "";
    const orderApi = new OrderApi();
    const menuItemApi = new MenuItemApi();

    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingOrder, setEditingOrder] = useState<OrderDto | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const role = localStorage.getItem("selectedRole");
        setUserRole(role);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [menuResponse, ordersResponse] = await Promise.all([
                menuItemApi.getMenuItems(),
                orderApi.getOrders()
            ]);

            setMenuItems(menuResponse?.data ?? []);
            setOrders(ordersResponse?.data ?? []);

            console.log("📥 menuItems:", menuResponse.data);
            console.log("📥 orders:", ordersResponse.data);

        } catch (error) {
            setError("❌ לא ניתן לטעון נתונים: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (id: number) => {
        if (!window.confirm("⚠️ האם אתה בטוח שברצונך למחוק את ההזמנה?")) return;

        try {
            await orderApi.deleteOrder({ id }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setOrders(prev => prev.filter(order => order.id !== id));
        } catch (error) {
            setError("❌ שגיאה במחיקת ההזמנה: " + (error as Error).message);
        }
    };

    const handleEdit = (order: OrderDto) => {
        setEditingOrder({ ...order, orderMenuItems: order.orderMenuItems ?? [] });
        setOpenEditDialog(true);
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (editingOrder) {
            setEditingOrder({ ...editingOrder, [name]: value });
        }
    };

    const handleMenuItemChange = (event: SelectChangeEvent<number[]>) => {
        const selectedIds = event.target.value as number[];

        if (!editingOrder) return;

        const updatedOrderMenuItems = selectedIds.map(id => ({
            menuItemId: id
        }));

        setEditingOrder({
            ...editingOrder,
            orderMenuItems: updatedOrderMenuItems
        });
    };
    const handleEditSave = async () => {
        console.log("🛠️ התחלת שמירה");

        if (!editingOrder || !editingOrder.id) {
            setError("❌ ההזמנה לעריכה לא תקינה.");
            return;
        }

        if (!token) {
            setError("❌ אין טוקן. אנא התחבר מחדש.");
            return;
        }

        if (!editingOrder.customerName || !editingOrder.phone || !editingOrder.orderDate) {
            setError("❌ כל השדות חייבים להיות מלאים.");
            return;
        }

        if (!editingOrder.orderMenuItems || editingOrder.orderMenuItems.length === 0) {
            setError("❌ ההזמנה חייבת לכלול לפחות פריט אחד.");
            return;
        }

        try {
            const updatedOrderDto: OrderDto = {
                id: editingOrder.id,
                customerName: editingOrder.customerName,
                phone: editingOrder.phone,
                orderDate: editingOrder.orderDate,
                customerId: editingOrder.customerId ?? 0,
                orderMenuItems: editingOrder.orderMenuItems.map(item => ({
                    orderId: editingOrder.id ?? 0,
                    menuItemId: item.menuItemId
                }))
            };

            console.log("📦 נשלח ל-API:", updatedOrderDto);

            await orderApi.updateOrder({
                id: editingOrder.id,
                orderDto: updatedOrderDto
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            await fetchData();
            setOpenEditDialog(false);
            setEditingOrder(null);
            setError(null);
            console.log("✅ עדכון הצליח!");
        } catch (err) {
            console.error("❌ שגיאה בעדכון ההזמנה:", err);
            setError("❌ שגיאה בעדכון ההזמנה: " + (err as Error).message);
        }
    };



    return (
        <Container className="orders-container">
            <Typography variant="h4" gutterBottom className="orders-title">📦 ניהול הזמנות</Typography>

            {loading && <CircularProgress className="orders-loading" />}
            {error && <Typography className="orders-error">{error}</Typography>}

            {!loading && !error && orders.length === 0 && (
                <Typography className="orders-no-data">לא נמצאו הזמנות.</Typography>
            )}

            {!loading && !error && orders.length > 0 && (
                <Paper elevation={3} className="orders-paper">
                    <List className="orders-list">
                        {orders.map((order) => (
                            <ListItem key={order.id} divider className="order-item">
                                <ListItemText
                                    className="order-details"
                                    primary={`הזמנה #${order.id} - לקוח: ${order.customerName || "לא ידוע"}`}
                                    secondary={
                                        <>
                                            📅 {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "תאריך לא זמין"}<br />
                                            📞 {order.phone}<br />
                                            📋 {order.orderMenuItems?.map((omi) => {
                                            const matchedItem = menuItems.find((mi) => mi.id === omi.menuItemId);
                                            return matchedItem?.name;
                                        }).join(", ") || "לא צויינו פריטים"}
                                        </>
                                    }
                                />
                                {userRole === "Admin" && (
                                    <div className="action-buttons">
                                        <Button className="edit-button" onClick={() => handleEdit(order)}>ערוך</Button>
                                        <Button className="delete-button" onClick={() => handleDelete(order.id!)}>מחק</Button>
                                    </div>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} className="edit-dialog">
                <DialogTitle className="dialog-title">✏️ עריכת הזמנה</DialogTitle>
                <DialogContent className="dialog-content">
                    <TextField className="dialog-input" label="שם לקוח" name="customerName" value={editingOrder?.customerName || ""} onChange={handleEditChange} fullWidth />
                    <TextField className="dialog-input" label="טלפון" name="phone" value={editingOrder?.phone || ""} onChange={handleEditChange} fullWidth />
                    <TextField
                        className="dialog-input"
                        label="תאריך הזמנה"
                        type="date"
                        value={editingOrder?.orderDate ? new Date(editingOrder.orderDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder!, orderDate: e.target.value })}
                        fullWidth
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>בחר פריטים</InputLabel>
                        <Select
                            multiple
                            value={editingOrder?.orderMenuItems?.map(item => item.menuItemId!) ?? []}
                            onChange={handleMenuItemChange}
                        >
                            {menuItems.map((item) => (
                                <MenuItem key={item.id} value={item.id!}>{item.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)} className="cancel-button">ביטול</Button>
                    <Button onClick={handleEditSave} className="save-button">שמור</Button>
                </DialogActions>
            </Dialog>
        </Container>

    );
};

export default Orders;
