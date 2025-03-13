import { useEffect, useState } from "react";
import {
    Typography, Container, Paper, List, ListItem, ListItemText, CircularProgress,
    Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl,
    InputLabel, Select, MenuItem, SelectChangeEvent
} from "@mui/material";
import { getOrders, updateOrder, deleteOrder } from "../../Api/orderService.ts";
import { getMenuItems } from "../../Api/menuItemService.ts";
import { OrderDto, MenuItemDto } from "../../Types/apiTypes.ts";
import "./Order.css";
import * as React from "react";

const Orders = () => {
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

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // מביא את ההזמנות והתפריט
                const [ordersData, menuData] = await Promise.all([getOrders(), getMenuItems()]);

                setOrders(ordersData);
                setMenuItems(menuData);
            } catch (error) {
                setError("❌ לא ניתן לטעון נתונים: " + error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteOrder(id);
            setOrders((prevOrders) => prevOrders.filter(order => order.id !== id));
        } catch (error) {
            setError("❌ לא ניתן למחוק את ההזמנה: " + error);
        }
    };

    const handleEdit = (order: OrderDto) => {
        setEditingOrder({ ...order, orderMenuItems: order.orderMenuItems ?? [] }); // הבטחת רשימה ריקה במקום undefined
        setOpenEditDialog(true);
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (editingOrder) {
            setEditingOrder({ ...editingOrder, [event.target.name]: event.target.value });
        }
    };

    const handleMenuItemChange = (event: SelectChangeEvent<number[]>) => {
        if (editingOrder) {
            setEditingOrder({
                ...editingOrder,
                orderMenuItems: (event.target.value as number[]).map((id) => ({
                    orderId: editingOrder.id ?? 0,
                    menuItemId: id,
                })),
            });
        }
    };

    const handleEditSave = async () => {
        if (!editingOrder || editingOrder.id === undefined) {
            setError("❌ שגיאה: ההזמנה לעריכה לא תקינה.");
            return;
        }

        if (!editingOrder.customerName || !editingOrder.phone || !editingOrder.orderDate) {
            setError("❌ שגיאה: כל השדות חייבים להיות מלאים.");
            return;
        }

        if (!editingOrder.orderMenuItems || editingOrder.orderMenuItems.length === 0) {
            setError("❌ שגיאה: ההזמנה חייבת לכלול לפחות פריט אחד.");
            return;
        }

        try {
            await updateOrder(editingOrder.id, editingOrder);

            setOrders((prevOrders) =>
                prevOrders.map(order =>
                    order.id === editingOrder.id ? { ...order, ...editingOrder } : order
                )
            );

            setOpenEditDialog(false);
            setEditingOrder(null);
        } catch (error) {
            setError("❌ שגיאה בעדכון הזמנה: " + error);
        }
    };

    return (
        <Container className="orders-container">
            <Typography variant="h4" gutterBottom className="orders-title">📦 ניהול הזמנות</Typography>

            {loading && <CircularProgress className="orders-loading" />}
            {error && <Typography color="error" className="orders-error">{error}</Typography>}

            {!loading && !error && orders.length === 0 && (
                <Typography color="textSecondary" className="orders-no-data">לא נמצאו הזמנות.</Typography>
            )}

            {!loading && !error && orders.length > 0 && (
                <Paper elevation={3} className="orders-paper">
                    <List className="orders-list">
                        {orders.map((order) => (
                            <ListItem key={order.id} divider className="order-item">
                                <ListItemText
                                    primary={<span className="order-primary">הזמנה #{order.id} - לקוח: {order.customerName || "לא ידוע"}</span>}
                                    secondary={
                                        <>
                                            <Typography variant="body2" component="span" className="order-secondary">📅 תאריך: {new Date(order.orderDate).toLocaleDateString()}</Typography>
                                            <br />
                                            <Typography variant="body2" component="span" className="order-secondary">📞 טלפון: {order.phone || "לא זמין"}</Typography>
                                            <br />
                                            <Typography variant="body2" component="span" className="order-secondary">
                                                📋 פריטים: {order.orderMenuItems?.map(item =>
                                                menuItems.find(menu => menu.id === item.menuItemId)?.name || "לא ידוע"
                                            ).join(", ")}
                                            </Typography>
                                        </>
                                    }
                                />
                                {userRole === "Admin" && (
                                    <>
                                        <Button variant="outlined" color="primary" className="order-edit" onClick={() => handleEdit(order)}>ערוך</Button>
                                        <Button variant="outlined" color="secondary" className="order-delete" onClick={() => handleDelete(order.id ?? 0)}>מחק</Button>
                                    </>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>עריכת הזמנה</DialogTitle>
                <DialogContent>
                    <TextField
                        label="שם לקוח"
                        name="customerName"
                        value={editingOrder?.customerName || ""}
                        onChange={handleEditChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="טלפון"
                        name="phone"
                        value={editingOrder?.phone || ""}
                        onChange={handleEditChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="תאריך הזמנה"
                        name="orderDate"
                        type="date"
                        value={editingOrder?.orderDate?.split("T")[0] || ""}
                        onChange={handleEditChange}
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>בחר פריטים</InputLabel>
                        <Select
                            multiple
                            value={editingOrder?.orderMenuItems?.map(item => item.menuItemId) ?? []}
                            onChange={handleMenuItemChange}
                            renderValue={(selected) => menuItems.filter(item => selected.includes(item.id!)).map(item => item.name).join(", ")}
                        >
                            {menuItems.map((item) => (
                                <MenuItem key={item.id} value={item.id!}>{item.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)} color="secondary">ביטול</Button>
                    <Button onClick={handleEditSave} color="primary">שמור</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Orders;
