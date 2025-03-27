import { useEffect, useState } from "react";
import { Container, Typography, Paper, CircularProgress } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

interface JwtPayloadWithRoles {
    Id: string;
    Email: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
    exp: number;
}

const UserProfile = () => {
    const [user, setUser] = useState<JwtPayloadWithRoles | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decoded = jwtDecode<JwtPayloadWithRoles>(token);
            setUser(decoded);
        } catch (err) {
            console.error("שגיאה בפענוח הטוקן:", err);
        } finally {
            setLoading(false);
        }
    }, [navigate]);



    if (loading) return <CircularProgress />;

    return (
        <Container className="profile-container">
            <Paper className="profile-card" elevation={3}>
                <Typography variant="h5" className="profile-title">🧑 פרופיל משתמש</Typography>
                <Typography><strong>אימייל:</strong> {user?.Email}</Typography>
                <Typography><strong>מזהה:</strong> {user?.Id}</Typography>

            </Paper>
        </Container>
    );
};

export default UserProfile;
