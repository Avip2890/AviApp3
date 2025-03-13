import { useEffect, useState } from "react";
import {
    Typography, Container, Paper, List, ListItem, ListItemText,
    CircularProgress, Chip, Button, Dialog, DialogTitle,
    DialogContent, TextField, DialogActions
} from "@mui/material";
import { getMenuItems, updateMenuItem, deleteMenuItem } from "../../Api/menuItemService.ts";
import { MenuItemDto } from "../../Types/apiTypes.ts";
import "./Menu.css";

const MenuPage = () => {
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<MenuItemDto | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getMenuItems();
                setMenuItems(data);
            } catch (error) {
                setError("❌ לא ניתן לטעון את התפריט. " + error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();

    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                console.log("🔍 Token Decoded:", decodedToken);

                const rolesClaimKey = Object.keys(decodedToken).find(key => key.toLowerCase().includes("role"));
                const rolesClaim = rolesClaimKey ? decodedToken[rolesClaimKey] : [];

                const rolesArray = Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];

                setIsAdmin(rolesArray.includes("Admin"));
            } catch (err) {
                console.error("❌ שגיאה בפענוח הטוקן:", err);
            }
        }
    }, []);

    const handleEdit = (item: MenuItemDto) => {
        setEditingItem({ ...item });
        setOpenEditDialog(true);
    };


    const handleEditSave = async () => {
        if (editingItem && editingItem.id) {
            try {
                await updateMenuItem(editingItem.id, editingItem);
                setMenuItems(prevItems => prevItems.map(item => item.id === editingItem.id ? editingItem : item));
                setOpenEditDialog(false);
            } catch (error) {
                setError("❌ לא ניתן לעדכן את הפריט. " + error);
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMenuItem(id);
            setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
        } catch (error) {
            setError("❌ לא ניתן למחוק את הפריט. " + error);
        }
    };

    return (
        <Container className="menu-container">
            <Typography variant="h4" className="menu-title">🍽️ תפריט המסעדה</Typography>

            {loading && <CircularProgress className="menu-loading" />}
            {error && <Typography color="error" className="menu-error">{error}</Typography>}

            {!loading && !error && menuItems.length === 0 && (
                <Typography color="textSecondary" className="menu-no-data">לא נמצאו פריטים בתפריט.</Typography>
            )}

            {!loading && !error && menuItems.length > 0 && (
                <Paper elevation={3} className="menu-paper">
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.id} divider className="menu-item">
                                <ListItemText primary={<span className="menu-item-name">{item.name}</span>} />
                                <Typography variant="body2" component="div" className="menu-item-description">
                                    {item.description || "אין תיאור"}
                                </Typography>
                                <div className="menu-item-status">
                                    <Typography variant="body2" component="span" className="menu-item-price">
                                        ₪ מחיר: {item.price}
                                    </Typography>
                                    <Chip
                                        label={item.isAvailable ? "✅ זמין" : "❌ לא זמין"}
                                        className={item.isAvailable ? "available-chip" : "unavailable-chip"}
                                    />
                                </div>

                                {isAdmin ? (
                                    <div className="menu-item-actions">
                                        <Button variant="outlined" color="primary" onClick={() => handleEdit(item)}>✏️ עריכה</Button>
                                        <Button variant="outlined" color="secondary" onClick={() => handleDelete(item.id!)}>🗑️ מחיקה</Button>
                                    </div>
                                ) : (
                                    <Typography color="error">🔒 אין לך הרשאה לניהול התפריט</Typography>
                                )}

                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>✏️ עריכת פריט</DialogTitle>
                <DialogContent>
                    <TextField
                        label="שם הפריט"
                        value={editingItem?.name || ""}
                        onChange={(e) => setEditingItem({ ...editingItem!, name: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="תיאור"
                        value={editingItem?.description || ""}
                        onChange={(e) => setEditingItem({ ...editingItem!, description: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="מחיר (₪)"
                        type="number"
                        value={editingItem?.price || 0}
                        onChange={(e) => setEditingItem({ ...editingItem!, price: parseFloat(e.target.value) || 0 })}
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

export default MenuPage;
