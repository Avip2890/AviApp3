import { useEffect, useState } from "react";

const useIsAdmin = (): boolean => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const selectedRole = localStorage.getItem("selectedRole");
        setIsAdmin(selectedRole === "Admin");
    }, []);

    return isAdmin;
};

export default useIsAdmin;
