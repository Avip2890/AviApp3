import { useEffect, useState } from "react";
import {
    Typography, Container, Paper, List, ListItem, ListItemText, CircularProgress,
    Chip, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Box
} from "@mui/material";
import { MenuItemApi, MenuItemDto } from "../../open-api";
import "./Menu.css";
import UnsplashImagePicker from "../UnsplashImagePicker/UnsplashImagePickerComponent.tsx";
import useIsAdmin from "../../store/useIsAdmin.ts"

const MenuPage = () => {
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<MenuItemDto | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const isAdmin = useIsAdmin(); // ✅ החלפה במקום שימוש ב־useState

    const menuItemApi = new MenuItemApi();

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await menuItemApi.getMenuItems();
                setMenuItems(response.data);
            } catch (error) {
                setError("❌ לא ניתן לטעון את התפריט. " + (error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    const handleEdit = (item: MenuItemDto) => {
        setEditingItem({ ...item });
        setOpenEditDialog(true);
    };

    const handleEditSave = async () => {
        if (!editingItem || !editingItem.id) {
            setError("❌ הפריט לא תקין לעריכה.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ אין טוקן. אנא התחבר מחדש.");
            return;
        }

        try {
            await menuItemApi.updateMenuItem({
                id: editingItem.id,
                menuItemDto: {
                    name: editingItem.name,
                    description: editingItem.description,
                    price: editingItem.price,
                    isAvailable: editingItem.isAvailable,
                    imageUrl: editingItem.imageUrl ?? ""
                }
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const response = await menuItemApi.getMenuItems();
            setMenuItems(response.data);
            setOpenEditDialog(false);
            setEditingItem(null);
            setError(null);

        } catch (err) {
            setError("❌ לא ניתן לעדכן את הפריט. " + err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("⚠️ האם אתה בטוח שברצונך למחוק את הפריט הזה?")) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ אין טוקן, אנא התחבר מחדש.");
            return;
        }

        if (!isAdmin) {
            setError("❌ אין לך הרשאה למחוק פריטים.");
            return;
        }

        try {
            await menuItemApi.deleteMenuItem({ id }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
        } catch (error) {
            setError("❌ לא ניתן למחוק את הפריט. " + (error as Error).message);
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
                                {item.imageUrl && (
                                    <img src={item.imageUrl} alt={item.name} className="menu-item-image" />
                                )}
                                <ListItemText
                                    primary={<span className="menu-item-name">{item.name}</span>}
                                    secondary={<span className="menu-item-description">{item.description || "אין תיאור"}</span>}
                                />
                                <div className="menu-item-status">
                                    <Typography variant="body2" className="menu-item-price">
                                        ₪ {item.price}
                                    </Typography>
                                    <Chip
                                        label={item.isAvailable ? "✅ זמין" : "❌ לא זמין"}
                                        className={item.isAvailable ? "available-chip" : "unavailable-chip"}
                                    />
                                </div>

                                {isAdmin && (
                                    <div className="menu-item-actions">
                                        <Button variant="outlined" color="primary" onClick={() => handleEdit(item)}>✏️ עריכה</Button>
                                        <Button variant="outlined" color="secondary" onClick={() => handleDelete(item.id!)}>🗑️ מחיקה</Button>
                                    </div>
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
                        value={editingItem?.price?.toString() || "0"}
                        onChange={(e) => setEditingItem({ ...editingItem!, price: parseFloat(e.target.value) || 0 })}
                        fullWidth
                        margin="dense"
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>בחר תמונה חדשה מ־Unsplash:</Typography>
                    <UnsplashImagePicker
                        onSelect={(imageUrl) =>
                            editingItem && setEditingItem(prev => prev ? { ...prev, imageUrl } : null)
                        }
                    />
                    {editingItem?.imageUrl && (
                        <Box mt={2}>
                            <Typography variant="body2">תמונה נבחרת:</Typography>
                            <img
                                src={`${editingItem.imageUrl}?t=${new Date().getTime()}`}
                                alt="תמונה נבחרת"
                                className="preview-image"
                            />
                            <Box mt={1}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                        setEditingItem(prev => prev ? { ...prev, imageUrl: "" } : null)
                                    }
                                >
                                    הסר תמונה
                                </Button>
                            </Box>
                        </Box>
                    )}
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
