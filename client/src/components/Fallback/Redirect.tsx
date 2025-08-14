import { Navigate } from "react-router-dom";

import { useUser } from "../../context/UserContext";

export default function AutoRedirect() {
    const { isLoggedIn } = useUser();

    return <Navigate to={isLoggedIn ? '/home' : '/login'} replace />
}