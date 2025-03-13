import { useEffect, useState } from "react";
import { Container, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Chip } from "@mui/material";
import { MenuItemDto } from "../../Types/apiTypes.ts";
import {getMenuItems} from "../../Api/menuItemService.ts";
import "./Menu.css";

const MenuPage = () => {
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getMenuItems();
                setMenuItems(data);
            } catch (error) {
                setError( " ❌ לא ניתן לטעון את התפריט." + error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    return (
        <Container className="menu-container">
            <Typography variant="h4" className="menu-title"> תפריט המסעדה</Typography>

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
                                        label={item.isAvailable ? "זמין" : "לא זמין"}
                                        className={item.isAvailable ? "available-chip" : "unavailable-chip"}
                                    />
                                </div>

                            </ListItem>

                        ))}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default MenuPage;
