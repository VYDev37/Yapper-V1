import AuditLogs from "./AuditLogs";

import { Route, Outlet } from 'react-router-dom';

import { Protection, IsMobile } from '../../hooks';
import { MobileNav, Sidebar } from '../Navigation';

function AdminLayout() {
    const isMobile = IsMobile();

    if (isMobile)
        return (
            <>
                <MobileNav />
                <Outlet />
            </>
        );

    return (
        <div className="app-layout d-flex min-vh-100 w-100">
            <Sidebar />
            <main className="main-content flex-grow-1 w-100">
                <Outlet />
            </main>
        </div>
    )
}

export default function AdminRoutes() {
    return (
        <Route path="/admin/" element={
            <Protection role_id={2}>
               <AdminLayout /> 
            </Protection>}>
            <Route path="audit-logs" index element={<AuditLogs />} />
        </Route>
    );
}