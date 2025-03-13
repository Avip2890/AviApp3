import { Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
    const navigate = useNavigate();

    const handleRoleSelection = (role: string) => {
        localStorage.setItem("selectedRole", role); // שמירת תפקיד נבחר
        navigate(role === "Admin" ? "/admin" : "/orders");
        window.location.reload(); // פתרון אפשרי לבעיות רענון
    };

    return (
        <div className="role-selection-container">
            <Paper elevation={3} className="role-selection-box">
                <Typography variant="h5" gutterBottom>
                    באיזה מצב תרצה להיכנס?
                </Typography>

                <Button variant="contained" color="primary" fullWidth onClick={() => handleRoleSelection("Admin")}>
                    כניסה כמנהל
                </Button>

                <Button variant="contained" color="secondary" fullWidth onClick={() => handleRoleSelection("User")}>
                    כניסה כלקוח
                </Button>
            </Paper>
        </div>
    );
};

export default RoleSelection;
