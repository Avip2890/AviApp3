import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { NavbarProps } from "../../Interfaces/NavbarInterface.ts";
import { jwtDecode } from "jwt-decode"; // ספריית פענוח טוקן


interface JwtPayloadWithRoles {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
}


const getUserRoles = (): string[] => {
    const token = localStorage.getItem("token");
    if (!token) return [];

    try {
        const decodedToken: JwtPayloadWithRoles = jwtDecode<JwtPayloadWithRoles>(token);
        const rolesClaim = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        return Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];
    } catch (err) {
        console.error("❌ שגיאה בפענוח הטוקן:", err);
        return [];
    }
};

const Navbar = ({ isAuthenticated, roles, handleLogout }: NavbarProps) => {
    const navigate = useNavigate();
    const [userRoles, setUserRoles] = useState<string[]>(roles || []);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchedRoles = getUserRoles();
        setUserRoles(fetchedRoles);
        setIsLoading(false); // סיימנו לטעון
    }, []);

    const handleLogoutClick = () => {
        handleLogout();
        localStorage.removeItem("selectedRole");
        navigate("/");
    };

    const handleNavigation = (path: string) => {
        if (!isLoading) {
            navigate(path);
        } else {
            console.warn("⏳ התפקידים עדיין נטענים...");
        }
    };

    return (
        <AppBar position="static" className="navbar">
            <Toolbar className="navbar-toolbar">
                <Typography
                    variant="h6"
                    className="navbar-title"
                    onClick={() => handleNavigation("/")}
                >
                    AviApp
                </Typography>

                {isAuthenticated ? (
                    <div className="navbar-links">
                        {!isLoading && userRoles.includes("Admin") && (
                            <>
                                <Button color="inherit" onClick={() => handleNavigation("/admin")}>ניהול</Button>
                                <Button color="inherit" onClick={() => handleNavigation("/menuitems")}>ניהול תפריט</Button>
                                <Button color="inherit" onClick={() => handleNavigation("/orders")}>הזמנות</Button>
                            </>
                        )}
                        <Button color="inherit" onClick={handleLogoutClick}>התנתק</Button>
                    </div>
                ) : (
                    <Button color="inherit" onClick={() => handleNavigation("/login")}>התחברות</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
