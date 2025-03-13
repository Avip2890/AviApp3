import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { NavbarProps } from "../../Interfaces/NavbarInterface.ts";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated, roles, handleLogout }: NavbarProps) => {
    const navigate = useNavigate();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => navigate("/home")}
                >
                    AviApp
                </Typography>

                {isAuthenticated ? (
                    <>
                        {roles.includes("Admin") && (
                            <Button color="inherit" onClick={() => navigate("/admin")}>
                                ניהול
                            </Button>
                        )}
                        {roles.includes("User") && (
                            <Button color="inherit" onClick={() => navigate("/orders")}>
                                הזמנות
                            </Button>
                        )}
                        <Button color="inherit" onClick={handleLogout}>
                            התנתק
                        </Button>
                    </>
                ) : null}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
