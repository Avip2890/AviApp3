import { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Container, Typography } from "@mui/material";
import { MenuItemApi, MenuItemDto } from "../../open-api";

interface OrderFormProps {
    onOrderSubmit: (orderData: { customerName: string; email: string; phone: string; orderDate: string; selectedMenuItems: number[] }) => void;
}

const OrderForm = ({ onOrderSubmit }: OrderFormProps) => {
    const [customerName, setCustomerName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [orderDate, setOrderDate] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const menuItemApi = new MenuItemApi();

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await menuItemApi.getMenuItems();
                setMenuItems(response.data ?? []);
            } catch (err) {
                setError("❌ לא ניתן לטעון את התפריט." + (err as Error).message);
            }
        };

        fetchMenuItems();
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!customerName || !email || !phone || !orderDate || selectedMenuItems.length === 0) {
            setError("⚠️ יש למלא את כל השדות ולבחור לפחות פריט אחד מהתפריט.");
            return;
        }

        onOrderSubmit({ customerName, email, phone, orderDate, selectedMenuItems });
    };

    return (
        <Container>
            <Typography variant="h5">📝 יצירת הזמנה</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleSubmit}>
                <TextField label="שם לקוח" value={customerName} onChange={(e) => setCustomerName(e.target.value)} fullWidth />
                <TextField label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                <TextField label="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
                <TextField label="תאריך הזמנה" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} fullWidth />

                <FormControl fullWidth>
                    <InputLabel>בחר פריטים</InputLabel>
                    <Select multiple value={selectedMenuItems} onChange={(e) => setSelectedMenuItems(e.target.value as number[])}>
                        {menuItems.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" variant="contained" color="primary">המשך לתשלום</Button>
            </form>
        </Container>
    );
};

export default OrderForm;
