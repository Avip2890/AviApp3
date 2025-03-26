import { useEffect, useState } from "react";
import {
    Typography, Container, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress
} from "@mui/material";
import { UserApi, UserDto } from "../../open-api";
import "./UserManagement.css";
import * as React from "react";

const UserManagement = () => {
    const userApi = new UserApi();

    const [users, setUsers] = useState<UserDto[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [editingUser, setEditingUser] = useState<UserDto | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const usersResponse = await userApi.getUsers();
                setUsers(usersResponse.data);
                setFilteredUsers(usersResponse.data);
            } catch (error) {
                setError("❌ לא ניתן לטעון את המשתמשים: " + (error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);

        const filtered = users.filter(user =>
            (user.name ?? "").toLowerCase().includes(value.toLowerCase())
        );

        setFilteredUsers(filtered);
    };

    /** 📌 עריכת משתמש */
    const handleEdit = (user: UserDto) => {
        setEditingUser({ ...user });
        setOpenEditDialog(true);
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (editingUser) {
            setEditingUser({ ...editingUser, [event.target.name]: event.target.value });
        }
    };

    /** 📌 שמירת משתמש לאחר עריכה */
    const handleEditSave = async () => {
        if (editingUser && editingUser.id !== undefined) {
            try {
                await userApi.updateUser({ id: editingUser.id, userDto: editingUser }); // ✅ שימוש נכון ב- OpenAPI
                setUsers(prevUsers => prevUsers.map(user => user.id === editingUser.id ? editingUser : user));
                setFilteredUsers(prevUsers => prevUsers.map(user => user.id === editingUser.id ? editingUser : user));
                setOpenEditDialog(false);
                setEditingUser(null);
            } catch (error) {
                setError("❌ לא ניתן לעדכן את המשתמש. " + (error as Error).message);
            }
        }
    };

    const handleDelete = async () => {
        if (userToDelete !== null) {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("❌ לא נמצא טוקן. התחבר מחדש.");
                    return;
                }

                await userApi.deleteUser(
                    { id: userToDelete },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const updatedUsers = users.filter(user => user.id !== userToDelete);
                setUsers(updatedUsers);
                setFilteredUsers(updatedUsers);
                setOpenDeleteDialog(false);
            } catch (error) {
                setError("❌ לא ניתן למחוק את המשתמש. " + (error as Error).message);
            } finally {
                setUserToDelete(null);
            }
        }
    };


    return (
        <Container>
            <Typography variant="h4">👥 ניהול משתמשים</Typography>

            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}

            <TextField
                label="🔎 חיפוש משתמש"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={handleSearch}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>שם</TableCell>
                            <TableCell>אימייל</TableCell>
                            <TableCell>תאריך יצירה</TableCell>
                            <TableCell>פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.name ?? ""}</TableCell>
                                <TableCell>{user.email ?? ""}</TableCell>
                                <TableCell>
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : "תאריך לא זמין"}
                                </TableCell>
                                <TableCell>
                                    <Button variant="outlined" color="primary" onClick={() => handleEdit(user)}>✏️ עריכה</Button>
                                    <Button variant="outlined" color="secondary" onClick={() => { setUserToDelete(user.id!); setOpenDeleteDialog(true); }}>🗑️ מחיקה</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 🔹 דיאלוג עריכת משתמש */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>✏️ עריכת משתמש</DialogTitle>
                <DialogContent>
                    <TextField label="שם" name="name" value={editingUser?.name ?? ""} onChange={handleEditChange} fullWidth margin="dense" />
                    <TextField label="אימייל" name="email" value={editingUser?.email ?? ""} onChange={handleEditChange} fullWidth margin="dense" />
                    <TextField label="סיסמה" name="password" type="password" value={editingUser?.password ?? ""} onChange={handleEditChange} fullWidth margin="dense" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)} color="secondary">ביטול</Button>
                    <Button onClick={handleEditSave} color="primary">שמור</Button>
                </DialogActions>
            </Dialog>

            {/* 🔹 דיאלוג מחיקת משתמש */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>🗑️ מחיקת משתמש</DialogTitle>
                <DialogContent>
                    <Typography>האם אתה בטוח שברצונך למחוק משתמש זה?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">ביטול</Button>
                    <Button onClick={handleDelete} color="primary">מחק</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserManagement;
