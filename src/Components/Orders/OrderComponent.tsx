import { useEffect, useState } from "react";
import { Typography, Container, Paper, List, ListItem, ListItemText, CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { getOrders, updateOrder, deleteOrder } from "../../Api/orderService.ts";
import { OrderDto } from "../../Types/apiTypes.ts";
import "./Order.css";

const Orders = () => {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingOrder, setEditingOrder] = useState<OrderDto | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const role = localStorage.getItem("selectedRole");
        setUserRole(role);
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const ordersData = await getOrders();
                setOrders(ordersData);
            } catch (error) {
                console.error(error);
                setError("❌ לא ניתן לטעון את ההזמנות.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteOrder(id);
            setOrders((prevOrders) => prevOrders.filter(order => order.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (order: OrderDto) => {
        setEditingOrder(order);
        setOpenEditDialog(true);
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (editingOrder) {
            setEditingOrder({ ...editingOrder, [event.target.name]: event.target.value });
        }
    };

    const handleEditSave = async () => {
        if (editingOrder) {
            try {
                await updateOrder(editingOrder.id ?? 0, editingOrder);
                setOrders((prevOrders) => prevOrders.map(order => order.id === editingOrder.id ? editingOrder : order));
                setOpenEditDialog(false);
                setEditingOrder(null);
            } catch (error) {
                console.error(error);
            }
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
