import { Route, Navigate } from 'react-router-dom';

import Login from './Login';
import Register from './Register';
import ForgetPassword from './ForgetPassword';
import ResetPassword from './ResetPassword';

import { useUser } from '../../context/UserContext';

export default function AccountRoutes() {
    const { isLoggedIn } = useUser();

    return (
        <>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
        </>
    );
}