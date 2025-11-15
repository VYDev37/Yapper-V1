import { NavLink, useNavigate } from 'react-router-dom';
import vitelogo from '../../assets/vite.svg';

import { useUser } from '../../context/UserContext';

export default function Sidebar() {
    const { user } = useUser();
    const navigate = useNavigate();

    const navLinks = [
        { id: 1, label: "Home", ref: "/home", icon: "fas fa-home" },
        { id: 2, label: "Search", ref: "/search", icon: "fas fa-magnifying-glass" },
        { id: 3, label: "Profile", ref: "/profile", icon: "fas fa-user" },
        { id: 4, label: "Messages", ref: "/message", icon: "fas fa-envelope" },
        { id: 5, label: "Notifications", ref: "/notification", icon: "fas fa-bell" },
        { id: 6, label: "Settings", ref: "/settings", icon: "fas fa-cog" }
    ];

    return (
        <div className="sidebar-container d-flex h-100 ms-auto mr-auto" style={{ padding: '0 10px' }}>
            <div className="sidebar position-fixed mt-4 px-5 border-yapper-right">
                <div className="sidebar-header d-flex align-items-center" style={{ paddingLeft: '28px', paddingTop: '10px', paddingBottom: '10px' }}>
                    <img src={vitelogo} alt="Vite logo" className="app-logo" />
                    <h3 className="sidebar-title mt-1 mx-2" style={{ fontWeight: '800' }}>Yapper</h3>
                </div>
                <div className="nav flex-column">
                    {navLinks.map(link => (
                        <NavLink to={link.ref} key={link.id} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                            <i className={link.icon}></i>
                            <span className="d-none d-md-inline">{link.label}</span>
                        </NavLink>
                    ))}
                    {user?.role_id! >= 2 && (
                        <NavLink to="/admin/audit-logs" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                            <i className="fas fa-history"></i>
                            <span className="d-none d-md-inline">Audit Logs</span>
                        </NavLink>
                    )}
                    <a className="btn btn-yapper text-decoration-none round-30 mt-3 ms-3"
                        onClick={() => navigate("/home#post-message-content")} style={{ height: '50px' }}>
                        Post
                    </a>

                </div>
            </div>
        </div>
    );
}