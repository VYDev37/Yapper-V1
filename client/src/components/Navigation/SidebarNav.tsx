import { NavLink } from 'react-router-dom';
import vitelogo from '../../assets/vite.svg';

import { useUser } from '../../context/UserContext';

export default function Sidebar() {
    const { user } = useUser();

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
                    {user?.role_id! >= 2 && (
                        <NavLink to="/admin/audit-logs" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                            <i className="fas fa-history"></i>
                            <span className="d-none d-md-inline">Audit Logs</span>
                        </NavLink>
                    )}
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