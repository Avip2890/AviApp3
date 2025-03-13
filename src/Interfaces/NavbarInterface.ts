export interface NavbarProps {
    isAuthenticated: boolean;
    roles: string[];
    handleLogout: () => void;
}
