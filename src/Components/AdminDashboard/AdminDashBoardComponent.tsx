import {  useState } from "react";
import {
    Typography, Box, Stack, Card, CardContent, Button,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    FormControl, InputLabel, Select, MenuItem, CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createMenuItem } from "../../Api/menuItemService.ts";
import { MenuItemDto } from "../../Types/apiTypes.ts";
import "./AdminDashboard.css";
import * as React from "react";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);
    const [menuItem, setMenuItem] = useState<MenuItemDto>({
        name: "",
        description: "",
        price: 0,
        isAvailable: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // ✅ בדיקה אם יש טוקן
        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ אין טוקן - יש להתחבר מחדש.");
            setLoading(false);
            return;
        }

        // ✅ וידוא שכל השדות מלאים
        if (!menuItem.name || menuItem.price <= 0) {
            setError("⚠️ חובה להזין שם ומחיר לפריט.");
            setLoading(false);
            return;
        }

        try {
            console.log("📡 שליחת פריט עם טוקן:", token);
            console.log("📡 נתונים שנשלחים:", menuItem);

            const response = await createMenuItem(menuItem);
            console.log("✅ תגובת השרת:", response);

            setSuccess("✅ הפריט נוסף בהצלחה!");
            setMenuItem({ name: "", description: "", price: 0, isAvailable: true });
        } catch (error) {
            console.error("❌ שגיאה ביצירת פריט:", error);

            // ✅ הצגת שגיאה מפורטת אם קיימת תגובת שגיאה מהשרת
            if (error) {
                setError(`❌ שגיאה:  "לא ניתן להוסיף את הפריט"`+ error);
            } else {
                setError("❌ שגיאה כללית - נסה שוב מאוחר יותר.");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <Box className="admin-dashboard">
            <Typography variant="h4" className="dashboard-title">🎛️ לוח ניהול</Typography>
            <Typography className="dashboard-subtitle">ברוך הבא למערכת הניהול! כאן תוכל לנהל את העסק בקלות.</Typography>

            {/* אזור הסטטיסטיקות */}
            <Stack spacing={3} direction="row" justifyContent="center" className="dashboard-stats">
                <Card className="dashboard-card">
                    <CardContent>
                        <Typography variant="h6">📦 סה"כ הזמנות</Typography>
                        <Typography variant="h4">125</Typography>
                    </CardContent>
                </Card>
                <Card className="dashboard-card">
                    <CardContent>
                        <Typography variant="h6">🍽️ פריטים בתפריט</Typography>
                        <Typography variant="h4">32</Typography>
                    </CardContent>
                </Card>
                <Card className="dashboard-card">
                    <CardContent>
                        <Typography variant="h6">👥 מספר משתמשים</Typography>
                        <Typography variant="h4">57</Typography>
                    </CardContent>
                </Card>
                <Card className="dashboard-card">
                    <CardContent>
                        <Typography variant="h6">💰 הכנסה חודשית</Typography>
                        <Typography variant="h4">₪12,450</Typography>
                    </CardContent>
                </Card>
            </Stack>

            {/* כפתורי ניהול */}
            <Stack spacing={3} direction="row" justifyContent="center" className="dashboard-actions">
                <Button variant="contained" color="primary" className="dashboard-button" onClick={() => navigate("/orders")}>
                    📦 ניהול הזמנות
                </Button>
                <Button variant="contained" color="secondary" className="dashboard-button" onClick={handleOpenDialog}>
                    🍽️ ניהול תפריט
                </Button>
                <Button variant="contained" color="success" className="dashboard-button" onClick={() => navigate("/users")}>
                    👥 ניהול משתמשים
                </Button>
            </Stack>

            {/* דיאלוג להוספת פריט חדש לתפריט */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>🍽️ הוספת פריט חדש לתפריט</DialogTitle>
                <DialogContent>
                    {error && <Typography color="error">{error}</Typography>}
                    {success && <Typography color="primary">{success}</Typography>}

                    <TextField
                        label="שם הפריט"
                        value={menuItem.name}
                        onChange={(e) => setMenuItem({ ...menuItem, name: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="תיאור"
                        value={menuItem.description}
                        onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="מחיר (₪)"
                        type="number"
                        value={menuItem.price}
                        onChange={(e) => setMenuItem({ ...menuItem, price: parseFloat(e.target.value) || 0 })}
                        fullWidth
                        margin="dense"
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>זמינות</InputLabel>
                        <Select
                            value={menuItem.isAvailable ? "true" : "false"}
                            onChange={(e) => setMenuItem({ ...menuItem, isAvailable: e.target.value === "true" })}
                        >
                            <MenuItem value="true">זמין</MenuItem>
                            <MenuItem value="false">לא זמין</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">ביטול</Button>
                    <Button onClick={handleSubmit} color="primary" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : "📩 שמירה"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDashboard;
