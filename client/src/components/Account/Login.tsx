import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../../context/UserContext';

import LoginBg from '../../assets/LoginBg.jpg';
import { axios } from '../../config';

interface LoginData {
    username: string;
    password: string;
}

interface Alert {
    message: string;
    isError: boolean;
}

export default function Login() {
    const navigate = useNavigate();
    const [type, setType] = React.useState<string>('password');

    const { loading, RefreshUser } = useUser();

    const [loginData, setLoginData] = React.useState<LoginData>({
        username: '',
        password: ''
    });

    const [alert, setAlert] = React.useState<Alert>({
        message: '',
        isError: false
    });

    const HandleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading)
            return;

        try {
            const response = await axios.post('/login', loginData);
            if (response.status === 200) {
                RefreshUser();
                setAlert({
                    message: response.data.message || 'Login successful!',
                    isError: false
                });
                navigate('/home'); // Redirect to home or dashboard after successful login
            } else {
                setAlert({
                    message: response.data.message || 'Login failed. Please try again.',
                    isError: true
                });
            }
        } catch (error: any) {
            setAlert({
                message: error?.message || 'An error occurred during login.',
                isError: true
            });
        }
    };

    const HandleToggle = () => {
        setType(type === 'password' ? 'text' : 'password');
    }

    return (
        <div className="container-fluid login-container px-4 py-1 d-flex justify-content-center align-items-center vh-100"
            style={{ flexDirection: 'column', background: `url(${LoginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="card p-4 w-100 w-md-auto"
                style={{ maxWidth: '400px', maxHeight: '90vh', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                <h2 className="text-center mb-5">Login</h2>
                <form onSubmit={HandleSubmit}>
                    <div className="form-group mb-5">
                        <i className="fas fa-user"></i>
                        <input type="text" placeholder="Username or Email" onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} disabled={loading}
                            className="form-control border-0 shadow-none" style={{ boxShadow: 'none', border: 'none', outline: 'none' }} required />
                    </div>
                    <div className="form-group mb-4 d-flex position-relative">
                        <span><i className="fas fa-key"></i></span>
                        <input type={type} placeholder="Password" onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} disabled={loading}
                            className="form-control border-0 shadow-none" style={{ boxShadow: 'none', border: 'none', outline: 'none', paddingRight: '10px' }} required />
                        <span
                            onClick={HandleToggle}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#999'
                            }}
                            role="button"
                        >{type === 'password' ? <i className="fa fa-eye-slash" />
                            : <i className="fa fa-eye" />}</span>
                    </div>
                    {alert.message.trim() !== '' && (
                        <div className={`alert alert-${alert.isError ? "danger" : "success"} p-2`} role="alert">
                            {alert.message}
                        </div>)}
                    <button type="submit" className="btn btn-yapper mt-3" disabled={loading}>Login</button>
                    <div className="text-center mt-3">
                        <p><a href="/forget-password" style={{ color: 'black', textDecoration: 'none' }}>Forgot Password?</a></p>
                    </div>
                </form>
                <hr />
                <div className="text-center my-2">
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </div>
            </div>
        </div>
    );
}