import { useState } from "react";
import {
    Typography, Box, Stack, Card, CardContent, Button,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    FormControl, InputLabel, Select, MenuItem, CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MenuItemApi, MenuItemDto } from "../../open-api";
import UnsplashImagePicker from "../UnsplashImagePicker/UnsplashImagePickerComponent";
import "./AdminDashboard.css";
import * as React from "react";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const menuItemApi = new MenuItemApi();
    const [openDialog, setOpenDialog] = useState(false);
    const [editing, setEditing] = useState(false);
    const [menuItem, setMenuItem] = useState<MenuItemDto>({
        name: "",
        description: "",
        price: 0,
        isAvailable: true,
        imageUrl: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleOpenDialog = (editItem?: MenuItemDto) => {
        if (editItem) {
            setMenuItem(editItem);
            setEditing(true);
        } else {
            setMenuItem({ name: "", description: "", price: 0, isAvailable: true, imageUrl: "" });
            setEditing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setError(null);
        setSuccess(null);
        setEditing(false);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!menuItem.name || menuItem.price === 0) {
            setError("⚠️ חובה להזין שם ומחיר לפריט.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("❌ טוקן לא קיים. התחבר מחדש.");
                return;
            }

            if (editing && menuItem.id) {
                await menuItemApi.updateMenuItem({ id: menuItem.id, menuItemDto: menuItem }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSuccess("✅ הפריט עודכן בהצלחה!");
            } else {
                await menuItemApi.addMenuItem({ menuItemDto: menuItem }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSuccess("✅ הפריט נוסף בהצלחה!");
            }

            setMenuItem({ name: "", description: "", price: 0, isAvailable: true, imageUrl: "" });
            setOpenDialog(false);
        } catch (error) {
            setError(`❌ שגיאה: הפעולה נכשלה - ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="admin-dashboard">
            <Typography variant="h4" className="dashboard-title">🎛️ לוח ניהול</Typography>

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

            <Stack spacing={3} direction="row" justifyContent="center" className="dashboard-actions">
                <Button variant="contained" color="primary" onClick={() => navigate("/orders")}>📦 ניהול הזמנות</Button>
                <Button variant="contained" color="secondary" onClick={() => handleOpenDialog()}>🍽️ הוסף פריט</Button>
                <Button variant="contained" color="success" onClick={() => navigate("/users")}>👥 ניהול משתמשים</Button>
            </Stack>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? "✏️ עריכת פריט תפריט" : "🍽️ הוספת פריט חדש לתפריט"}</DialogTitle>
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
                        value={menuItem.price?.toString() || "0"}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setMenuItem({ ...menuItem, price: isNaN(value) ? 0 : value });
                        }}
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

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>בחר תמונה </Typography>
                    <UnsplashImagePicker onSelect={(imageUrl) => setMenuItem(prev => ({ ...prev, imageUrl }))} />

                    {menuItem.imageUrl && (
                        <Box mt={2}>
                            <Typography variant="body2">תמונה נבחרת:</Typography>
                            <img src={menuItem.imageUrl} alt="תמונה נבחרת" className="preview-image" />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">ביטול</Button>
                    <Button onClick={handleSubmit} color="primary" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : "📩 הוספה"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDashboard;