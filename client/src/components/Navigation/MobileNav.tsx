import { NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const NavBar = () => {
    const { user } = useUser();

    const navLinks = [
        { id: 1, label: "Home", ref: "/home", icon: "fas fa-home" },
        { id: 2, label: "Search", ref: "/search", icon: "fas fa-magnifying-glass" },
        { id: 3, label: "Profile", ref: "/profile", icon: "fas fa-user" },
        { id: 4, label: "Messages", ref: "/message", icon: "fas fa-envelope" },
        { id: 5, label: "Notifications", ref: "/notification", icon: "fas fa-bell" },
        { id: 6, label: "Settings", ref: "/settings", icon: "fas fa-cog" }
    ];

    return (
        <header className="mobile-nav ms-4">
            <nav className="navbar container-fluid">
                <div className="d-flex row col-12 col-md-12">
                    <ul className="navbar-nav mx-auto d-flex flex-row">
                        <>
                            {navLinks.map(link => (
                                <NavLink to={link.ref} key={link.id} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                    <i className={link.icon}></i>
                                    <span className="d-none d-md-inline"></span>
                                </NavLink>
                            ))}
                            {user?.role_id! >= 2 && (
                                <NavLink to="/admin/audit-logs" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                    <i className="fas fa-history"></i>
                                    <span className="d-none d-md-inline">Audit Logs</span>
                                </NavLink>
                            )}
                        </>
                    </ul>
                </div>
            </nav>

        </header>
    );
}

export default NavBar;