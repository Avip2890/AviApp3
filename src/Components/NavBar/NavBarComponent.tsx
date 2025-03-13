import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { NavbarProps } from "../../Interfaces/NavbarInterface.ts";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated, roles, handleLogout }: NavbarProps) => {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        handleLogout();
        navigate("/");
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => navigate("/")}
                >
                    AviApp
                </Typography>

                {isAuthenticated ? (
                    <>
                        {roles.includes("Admin") && (
                            <>
                                <Button color="inherit" onClick={() => navigate("/admin")}>ניהול</Button>
                                <Button color="inherit" onClick={() => navigate("/menu-items")}>ניהול תפריט</Button>
                            </>
                        )}
                        {roles.includes("Admin") && (
                            <Button color="inherit" onClick={() => navigate("/orders")}>הזמנות</Button>
                        )}
                        <Button color="inherit" onClick={handleLogoutClick}>התנתק</Button>
                    </>
                ) : (
                    <Button color="inherit" onClick={() => navigate("/login")}>התחברות</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
