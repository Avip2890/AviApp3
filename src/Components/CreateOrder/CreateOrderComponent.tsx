import { useEffect, useState } from "react";
import { Container, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from "@mui/material";
import { createOrder } from "../../Api/orderService.ts";
import { OrderDto, MenuItemDto } from "../../Types/apiTypes.ts";
import "./CreateOrder.css";
import {getMenuItems} from "../../Api/menuItemService.ts";
import * as React from "react";

const CreateOrderPage = () => {
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [orderDate, setOrderDate] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const data = await getMenuItems();
                setMenuItems(data);
            } catch (err) {
                console.error("❌ שגיאה בטעינת התפריט:", err);
            }
        };
        fetchMenuItems();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!customerName || !phone || !orderDate || selectedMenuItems.length === 0) {
            setError("⚠️ יש למלא את כל השדות ולבחור לפחות פריט אחד מהתפריט.");
            setLoading(false);
            return;
        }

        const orderData: OrderDto = {
            customerName,
            phone,
            orderDate,
            customerId: 1,
            orderMenuItems: selectedMenuItems.map((id) => ({ orderId: 0, menuItemId: id })),
        };

        try {
            await createOrder(orderData);
            setSuccess("✅ ההזמנה נוצרה בהצלחה!");
            setCustomerName("");
            setPhone("");
            setOrderDate("");
            setSelectedMenuItems([]);
        } catch (err) {
            console.error("❌ שגיאה ביצירת הזמנה:", err);
            setError("❌ לא ניתן ליצור את ההזמנה.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="create-order-container">
            <Typography variant="h4" className="create-order-title">📝 יצירת הזמנה חדשה</Typography>

            {error && <Typography color="error" className="error-message">{error}</Typography>}
            {success && <Typography color="primary" className="success-message">{success}</Typography>}

            <form onSubmit={handleSubmit} className="create-order-form">
                <TextField
                    label="שם לקוח"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="טלפון"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="תאריך הזמנה"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>בחר פריטים מהתפריט</InputLabel>
                    <Select
                        multiple
                        value={selectedMenuItems}
                        onChange={(e) => setSelectedMenuItems(e.target.value as number[])}
                        renderValue={(selected) => menuItems.filter(item => selected.includes(item.id!)).map(item => item.name).join(", ")}
                    >
                        {menuItems.map((item) => (
                            <MenuItem key={item.id} value={item.id!}>{item.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" variant="contained" color="primary" className="submit-button" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "📩 שליחת הזמנה"}
                </Button>
            </form>
        </Container>
    );
};

export default CreateOrderPage;
