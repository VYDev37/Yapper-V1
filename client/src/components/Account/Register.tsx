import React from 'react';
import RegisterBg from '../../assets/RegisterBg.jpg';

import { axios } from '../../config';

interface RegisterData {
    full_name: string;
    username: string;
    email: string;
    password: string;
}

interface Alert {
    message: string;
    isError: boolean;
}

export default function Register() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [registerData, setRegisterData] = React.useState<RegisterData>({
        full_name: '',
        username: '',
        email: '',
        password: ''
    });

    const [alert, setAlert] = React.useState<Alert>({
        message: '',
        isError: false
    });
    const [type, setType] = React.useState<string>('password');

    const HandleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (loading)
            return;

        setLoading(true);

        try {
            const response = await axios.post('/register', registerData);
            if (response.status === 200) {
                setAlert({
                    message: response.data.message || 'Registration successful! Please login.',
                    isError: false
                });
                setRegisterData({ full_name: '', username: '', password: '', email: '' });
            } else {
                setAlert({
                    message: response.data.message || 'Registration failed. Please try again.',
                    isError: true
                });
            }
        } catch (error: any) {
            setAlert({
                message: error.message || 'An error occurred during registration.',
                isError: true
            });
        } finally {
            setLoading(false);
        }
    }

    const HandleToggle = () => {
        setType(type === 'password' ? 'text' : 'password');
    } 

    return (
        <div className="container-fluid register-container px-4 py-1 d-flex justify-content-center align-items-center vh-100"
            style={{ background: `url(${RegisterBg})` }}>
            <div className="card p-4 w-100 w-md-auto"
                style={{ maxWidth: '400px', maxHeight: '90vh', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                <h2 className="text-center mb-5">Register</h2>
                <form onSubmit={(e) => HandleSubmit(e)}>
                    <div className="form-group mb-4">
                        <i className="fa fa-id-card"></i>
                        <input type="text" placeholder="Full Name" onChange={(e) => setRegisterData({...registerData, full_name: e.target.value})} disabled={loading}
                            className="form-control border-0 shadow-none" style={{ boxShadow: 'none', border: 'none', outline: 'none' }} required />
                    </div>
                    <div className="form-group mb-4">
                        <i className="fas fa-user"></i>
                        <input type="text" placeholder="Username" onChange={(e) => setRegisterData({...registerData, username: e.target.value})} disabled={loading}
                            className="form-control border-0 shadow-none" style={{ boxShadow: 'none', border: 'none', outline: 'none' }} required />
                    </div>
                    <div className="form-group mb-4">
                        <i className="fas fa-envelope"></i>
                        <input type="email" placeholder="Email" onChange={(e) => setRegisterData({...registerData, email: e.target.value})} disabled={loading}
                            className="form-control border-0 shadow-none" style={{ boxShadow: 'none', border: 'none', outline: 'none' }} required />
                    </div>
                    <div className="form-group mb-4 position-relative">
                        <i className="fas fa-key"></i>
                        <input type={type} placeholder="Password" onChange={(e) => setRegisterData({...registerData, password: e.target.value})} disabled={loading}
                            className="form-control border-0 shadow-none" style={{ boxShadow: 'none', border: 'none', outline: 'none' }} required />
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
                    <button type="submit" className="btn btn-yapper mt-3">Register</button>
                    <hr />
                    <div className="text-center mt-3">
                        <p>Already have an account? <a href="/login">Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
}