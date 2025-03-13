import { useState } from "react";
import { TextField, Paper, Typography, Button, Dialog, DialogTitle, DialogActions } from "@mui/material";
import "./LoginStyle.css";
import { login } from "../../Api/authService.ts";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setMessage(null);
        const response = await login({ email, password });

        if (response.success && response.token && response.user) {
            localStorage.setItem("token", response.token || "");
            localStorage.setItem("roles", JSON.stringify(response.user.roles || []));

            const roles = response.user.roles || [];

            if (roles.includes("Admin") && roles.includes("User")) {
                setUserRoles(roles);
            } else {
                const selectedRole = roles.includes("Admin") ? "Admin" : "User";
                localStorage.setItem("selectedRole", selectedRole);
                navigate(selectedRole === "Admin" ? "/admin" : "/orders");
                window.location.reload(); // רענון עמוד כדי לוודא ניווט תקין
            }
        } else {
            setMessage(`❌ שגיאה: ${response.message || "אירעה שגיאה לא ידועה"}`);
        }
    };

    const handleRoleSelection = (role: string) => {
        localStorage.setItem("selectedRole", role);
        navigate(role === "Admin" ? "/admin" : "/orders");
        window.location.reload();
    };

    return (
        <div className="login-container">
            <Paper elevation={4} className="login-box">
                <Typography variant="h5" className="login-title">התחברות</Typography>

                <TextField fullWidth label="אימייל" variant="outlined" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
                <TextField fullWidth label="סיסמה" type="password" variant="outlined" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />

                <Button variant="contained" color="primary" fullWidth className="login-button" onClick={handleLogin}>
                    התחבר
                </Button>

                {message && <Typography className={`login-message ${message.startsWith("✅") ? "success" : "error"}`}>{message}</Typography>}

                <Button color="secondary" fullWidth onClick={() => navigate("/signup")}>
                    אין לך חשבון? הירשם כאן
                </Button>
            </Paper>

            <Dialog open={userRoles.length > 0} className="role-dialog">
                <DialogTitle>בחר תפקיד להמשך</DialogTitle>
                <DialogActions>
                    {userRoles.map((role) => (
                        <Button key={role} onClick={() => handleRoleSelection(role)}>
                            המשך כ-{role}
                        </Button>
                    ))}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Login;
