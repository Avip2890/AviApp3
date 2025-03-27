import { useState } from "react";
import { TextField, Paper, Typography, Button, Dialog, DialogTitle, DialogActions } from "@mui/material";
import "./LoginStyle.css";
import { useNavigate } from "react-router-dom";
import { AuthApiFactory } from "../../open-api";
import * as JwtDecode from "jwt-decode";


interface JwtPayloadWithRoles {
    Id: string;
    Email: string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string[];
    exp: number;
}

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setMessage(null);
        const authApi = AuthApiFactory();
        try {
            const response = await authApi.login({ loginRequestDto: { email, password } });
            const token = response.data;
            localStorage.setItem("token", token);

            const decodedToken: JwtPayloadWithRoles = JwtDecode.jwtDecode(token);
            const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            const rolesArray = Array.isArray(roles) ? roles : [roles];

            // ✅ אם יש רק תפקיד אחד - נווט מיד
            if (rolesArray.length === 1) {
                localStorage.setItem("selectedRole", rolesArray[0]);
                navigate(rolesArray[0] === "Admin" ? "/admin" : "/orders");
                window.location.reload();
            } else {
                // ✅ אם יש יותר מתפקיד אחד - הצג דיאלוג בחירה
                setUserRoles(rolesArray);
            }

        } catch (error) {
            console.log(`❌ שגיאה: ${error || "אירעה שגיאה"}`);
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
