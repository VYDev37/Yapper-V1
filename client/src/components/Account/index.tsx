import {
    Route,
    Navigate
} from 'react-router-dom';

import Login from './Login';
import Register from './Register';

import { useUser } from '../../context/UserContext';

export default function AccountRoutes() {
    const { isLoggedIn } = useUser();

    return (
        <>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login />} />
            <Route path="/register" element={<Register />} />
        </>
    );
}