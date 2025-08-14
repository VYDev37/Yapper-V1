import React from 'react';
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';

import Loading from '../components/Fallback/Loading';

interface ProtectionProps {
    children: React.ReactNode;
    role_id: number | any;
}

export default function Protection({ children, role_id }: ProtectionProps) {
    const { loading, isLoggedIn, HasRoleAccess } = useUser();

    if (loading)
        return <Loading />;

    if (!HasRoleAccess(role_id))
        return <Navigate to={isLoggedIn ? '/home' : '/login'} replace />;

    return children;
}