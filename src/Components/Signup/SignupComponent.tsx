import { useState } from "react";
import { TextField, Paper, Typography, Button, MenuItem } from "@mui/material";
import { createUser } from "../../Api/userService.ts";
import { useNavigate } from "react-router-dom";
import "../Signup/Signup.css";
import axios from "axios";
import {UserDto} from "../../Types/apiTypes.ts";


const SignUp = () => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState("User");

    const navigate = useNavigate();


    const currentRoles = JSON.parse(localStorage.getItem("roles") || "[]");
    const isAdmin = currentRoles.includes("Admin");

    const handleSignUp = async () => {
        setMessage(null);


        const roles = isAdmin ? [{ name: selectedRole }] : [{ name: "User" }];


        const newUser: UserDto = {
            Name: userName,
            email,
            password,
            roles,
        };



        try {
            await createUser(newUser);
            setMessage("✅ ההרשמה הצליחה! ניתן להתחבר כעת.");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {


            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data;

                if (responseData?.errors) {
                    const errorMessages = Object.values(responseData.errors).flat().join("\n");
                    setMessage(`❌ שגיאה בהרשמה:\n${errorMessages}`);
                } else {
                    setMessage("❌ שגיאה בהרשמה. נסה שנית.");
                }
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
