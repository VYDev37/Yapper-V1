import React from 'react';
import { axios } from '../../config';

import LoginBg from '../../assets/LoginBg.jpg';

interface Alert {
    message: string;
    isError: boolean;
}

export default function ForgetPassword() {
    const [alert, setAlert] = React.useState<Alert>({
        message: '',
        isError: false
    });

    const [username, setUsername] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false);

    const HandleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();

            const res = await axios.post('/send-reset-password', { username });
            setAlert({ message: res.data.message, isError: res.status !== 200 });
        } catch (err: any) {
            setAlert({ message: err.message, isError: true });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container-fluid login-container px-4 py-1 d-flex justify-content-center align-items-center vh-100"
            style={{ flexDirection: 'column', background: `url(${LoginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="card p-4 w-100 w-md-auto"
                style={{ maxWidth: '400px', maxHeight: '90vh', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                <h2 className="text-center mb-5">Reset Password</h2>
                <form onSubmit={HandleSubmit}>
                    <div className="form-group mb-4">
                        <i className="fas fa-user"></i>
                        <input type="text" placeholder="Username or Email" onChange={(e) => setUsername(e.target.value)} disabled={loading}
                            className="form-control border-0 shadow-none" style={{ boxShadow: 'none', border: 'none', outline: 'none' }} required />
                    </div>
                    {alert.message.trim() !== '' && (
                        <div className={`alert alert-${alert.isError ? "danger" : "success"} p-2`} role="alert">
                            {alert.message}
                        </div>)}
                    <button type="submit" className="btn btn-yapper mt-3" disabled={loading}>Proceed</button>
                </form>
                <hr />
                <div className="text-center my-2">
                    <p>Already have an account? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    );
}