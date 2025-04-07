import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { NavbarProps } from "../../Interfaces/NavbarInterface.ts";
import useIsAdmin from "../../store/useIsAdmin.ts";



const Navbar = ({ isAuthenticated, handleLogout }: NavbarProps) => {
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
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
                        {isAdmin && !isLoading && (
                            <>
                                <Button color="inherit" onClick={() => handleNavigation("/admin")}>ניהול</Button>
                                <Button color="inherit" onClick={() => handleNavigation("/menuitems")}>ניהול תפריט</Button>
                                <Button color="inherit" onClick={() => handleNavigation("/orders")}>הזמנות</Button>
                            </>
                        )}

                        {!isAdmin && !isLoading && (
                            <Button color="inherit" onClick={() => handleNavigation("/profile")}>👤 פרופיל משתמש</Button>
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
