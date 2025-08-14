import { NavLink } from 'react-router-dom';
import { axios } from '../../config';

import SwalUtility from '../../utilities/SwalUtility';
import React from 'react';

import vitelogo from '../../assets/vite.svg';

export default function Sidebar() {
    const [loading, setLoading] = React.useState<boolean>(false);

    const SendLogout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading)
            return;

        try {
            setLoading(true);

            const result = await SwalUtility.SendConfirmationDialog("Are you sure", "You want to log out.", "Log out");

            if (result.isConfirmed) {
                const response = await axios.post('logout');

                if (response.status === 200) {
                    const signoutResult = await SwalUtility.SendSingleConfirmation("Signed out!", "You have successfully signed out.", "Return to Login");

                    const ReturnLogin = () => window.location.href = '/login';

                    if (signoutResult.isConfirmed)
                        ReturnLogin();
                    else
                        setTimeout(ReturnLogin, 100);
                }
                else
                    SwalUtility.SendMessage("Oops!", response.data?.message || "Something is wrong when trying to log out...", "error");
            }
        } catch (_) {
            //console.log(err);
            SwalUtility.SendMessage("Oops!", "Something is wrong when trying to log out", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="sidebar-container d-flex h-100 ms-auto mr-auto" style={{ padding: '0 10px' }}>
            <div className="sidebar position-fixed mt-4 px-5 border-yapper-right">
                <div className="sidebar-header d-flex align-items-center" style={{ paddingLeft: '28px', paddingTop: '10px', paddingBottom: '10px' }}>
                    <img src={vitelogo} alt="Vite logo" className="app-logo" />
                    <h3 className="sidebar-title mt-1 mx-2" style={{ fontWeight: '800' }}>Yapper</h3>
                </div>
                <div className="nav flex-column">
                    <NavLink to="/home" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                        <i className="fas fa-home"></i>
                        <span className="d-none d-md-inline">Home</span>
                    </NavLink>
                    <NavLink to="/search" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                        <i className="fas fa-magnifying-glass"></i>
                        <span className="d-none d-md-inline">Search</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                        <i className="fas fa-user"></i>
                        <span className="d-none d-md-inline">Profile</span>
                    </NavLink>
                    <NavLink to="/messages" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                        <i className="fas fa-envelope"></i>
                        <span className="d-none d-md-inline">Messages</span>
                    </NavLink>
                    <NavLink to="/notification" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                        <i className="fas fa-bell"></i>
                        <span className="d-none d-md-inline">Notifications</span>
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                        <i className="fas fa-cog"></i>
                        <span className="d-none d-md-inline">Settings</span>
                    </NavLink>
                    <button className="nav-link" onClick={(e) => SendLogout(e)} disabled={loading}>
                        <i className="fas fa-sign-out"></i>
                        <span className="d-none d-md-inline">Log out</span>
                    </button>
                    <a
                        className="btn btn-yapper text-decoration-none round-30 mt-3 ms-3"
                        href="/home#post-message-content"
                        style={{ height: '50px' }}
                    >
                        Post
                    </a>

                </div>
            </div>
        </div>
    );
}