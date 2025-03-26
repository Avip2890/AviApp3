import { useState } from "react";
import { TextField, Paper, Typography, Button, MenuItem } from "@mui/material";
import { UserApi, UserDto } from "../../open-api";
import { useNavigate } from "react-router-dom";
import "../Signup/Signup.css";


const SignUp = () => {
    const userApi = new UserApi();
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState("User");

    const currentRoles = JSON.parse(localStorage.getItem("roles") || "[]");
    const isAdmin = currentRoles.includes("Admin");

    /** 📌 הרשמת משתמש חדש */
    const handleSignUp = async () => {
        setMessage(null);

        if (!userName || !email || !password) {
            setMessage("⚠️ יש למלא את כל השדות.");
            return;
        }

        const roles = isAdmin ? [{ name: selectedRole }] : [{ name: "User" }];

        const newUser: UserDto = {
            name: userName,
            email,
            password,
            roles,
        };

        try {
            await userApi.addUser({ userDto: newUser }); // ✅ שימוש נכון ב-API
            setMessage("✅ ההרשמה הצליחה! ניתן להתחבר כעת.");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`❌ שגיאה בהרשמה: ${error.message}`);
            } else {
                setMessage("❌ שגיאה לא ידועה התרחשה.");
            }
        }
    };

    return (
        <div className="signup-container">
            <Paper elevation={4} className="signup-box">
                <Typography variant="h5" className="signup-title">הרשמה</Typography>

                <TextField
                    fullWidth
                    label="שם מלא"
                    variant="outlined"
                    margin="normal"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="input-field"
                />
                <TextField
                    fullWidth
                    label="סיסמה"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                />
                <TextField
                    fullWidth
                    label="אימייל"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                />

                {isAdmin && (
                    <TextField
                        select
                        fullWidth
                        label="בחר תפקיד"
                        variant="outlined"
                        margin="normal"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="input-field"
                    >
                        <MenuItem value="User">User</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                    </TextField>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    className="signup-button"
                    onClick={handleSignUp}
                >
                    הירשם
                </Button>

                {message && (
                    <Typography className={`signup-message ${message.startsWith("✅") ? "success" : "error"}`}>
                        {message}
                    </Typography>
                )}

                <Button color="secondary" fullWidth onClick={() => navigate("/login")}>
                    כבר יש לך חשבון? התחבר כאן
                </Button>
            </Paper>
        </div>
    );
};

export default SignUp;
