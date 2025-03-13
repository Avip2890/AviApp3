import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {CssBaseline, Container} from "@mui/material";
import Login from "./Components/Login/LoginComponent.tsx";
import Orders from "./Components/Orders/OrderComponent.tsx";
import AdminDashboard from "./Components/AdminDashboard/AdminDashBoardComponent.tsx";
import RoleSelection from "./Components/RoleSelection/RoleSelectionComponent.tsx";
import Navbar from "./Components/NavBar/NavBarComponent.tsx";
import SignUp from "./Components/Signup/SignupComponent.tsx";
import HomePage from "./Components/Home/HomePageComponent.tsx";
import MenuPage from "./Components/Menu/MenuComponent.tsx";
import CreateOrderPage from "./Components/CreateOrder/CreateOrderComponent.tsx";
import UserManagement from "./Components/UserManagement/UserManagementComponent.tsx";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [roles, setRoles] = useState<string[]>([]);


    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]"); // הפיכת הטקסט למערך
        const savedRole = localStorage.getItem("selectedRole");

        console.log("🔍 Token:", token);
        console.log("🔍 Roles:", storedRoles);
        console.log("🔍 Selected Role:", savedRole);

        if (token) {
            setIsAuthenticated(true);
            setRoles(Array.isArray(storedRoles) ? storedRoles : [storedRoles]);
        }


    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("roles");
        localStorage.removeItem("selectedRole");
        setIsAuthenticated(false);
        setRoles([]);

    };
    return (
        <Router>
            <CssBaseline />
            <Navbar isAuthenticated={isAuthenticated} roles={roles} handleLogout={handleLogout} />

            <Container sx={{ marginTop: 4 }}>
                <Routes>
                    <Route path= "/" element={<HomePage/>}/>
                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route
                        path="/orders"
                        element={
                            isAuthenticated && (roles.includes("User") || roles.includes("Admin"))
                                ? <Orders />
                                : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            isAuthenticated && roles.includes("Admin")
                                ? <AdminDashboard />
                                : <Navigate to="/login" />
                        }
                    />
                    <Route path="/users" element={<UserManagement/>}/>
                    <Route path="/menu-items" element={<MenuPage/>} />
                    <Route path="/role-selection" element={isAuthenticated ? <RoleSelection /> : <Navigate to="/login" />} />
                    <Route path="/create-orders" element={<CreateOrderPage/>}/>
                    <Route path="/" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
                </Routes>

            </Container>
        </Router>
    );
};

export default App;
