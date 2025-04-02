import { useEffect, useState } from "react";
import {
    Container, Typography, TextField, Button, MenuItem,
    Select, FormControl, InputLabel, CircularProgress
} from "@mui/material";
import { OrderApi, MenuItemApi, MenuItemDto, OrderDto } from "../../open-api";
import * as React from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayloadWithRoles {
    Id: string;
    Email: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
    exp: number;
}

const CreateOrderPage = () => {
    const [customerName, setCustomerName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [orderDate, setOrderDate] = useState<string>("");
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const menuItemApi = new MenuItemApi();
    const orderApi = new OrderApi();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayloadWithRoles>(token);
                setEmail(decoded.Email);
            } catch (err) {
                console.error("שגיאה בפענוח הטוקן:", err);
            }
        }

        // ✅ החזרת קריאת התפריט שנעלמה קודם
        const fetchMenuItems = async () => {
            try {
                const response = await menuItemApi.getMenuItems();
                setMenuItems(response.data ?? []);
            } catch (err) {
                setError(  "❌ לא ניתן לטעון את התפריט." + err);
            }
        };

        fetchMenuItems();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!customerName || !email || !phone || !orderDate || selectedMenuItems.length === 0) {
            setError("⚠️ יש למלא את כל השדות ולבחור לפחות פריט אחד מהתפריט.");
            setLoading(false);
            return;
        }

        const orderData: OrderDto = {
            customerName,
            email,
            phone,
            orderDate,
            orderMenuItems: selectedMenuItems.map((id) => ({ orderId: 0, menuItemId: id })),
        };

        try {
            await orderApi.addOrder({ orderDto: orderData });
            setSuccess("✅ ההזמנה נוצרה בהצלחה!");
            setCustomerName("");
            setPhone("");
            setOrderDate("");
            setSelectedMenuItems([]);
        } catch (err) {
            console.error("❌ שגיאה ביצירת הזמנה:", err);
            setError("❌ לא ניתן ליצור את ההזמנה. בדוק את הנתונים ונסה שוב.");
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
                    label="אימייל"
                    type="email"
                    value={email}
                    disabled
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
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>בחר פריטים מהתפריט</InputLabel>
                    <Select
                        multiple
                        value={selectedMenuItems}
                        onChange={(e) => setSelectedMenuItems(e.target.value as number[])}
                        renderValue={(selected) =>
                            menuItems
                                .filter(menuItem => selected.includes(menuItem.id!))
                                .map(menuItem => menuItem.name)
                                .join(", ")
                        }
                    >
                        {menuItems.map((menuItem) => (
                            <MenuItem key={menuItem.id} value={menuItem.id!}>{menuItem.name}</MenuItem>
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
