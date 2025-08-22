import { Route, Outlet, Navigate } from 'react-router-dom';

import Home from './Home';
import Profile from './Profile';
import SearchPage from './Search';
import Settings from './Settings';

import { Protection, IsMobile } from '../../hooks';
import { MobileNav, Sidebar } from '../Navigation';
import { ProfileInfo, ProfilePosts } from './Helper/Profile';
import { useUser } from '../../context/UserContext';

function UserLayout() {
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

export default function UserRoutes() {
    const { user } = useUser();

    return (
        <Route path="/" element={
            <Protection role_id={0}>
               <UserLayout /> 
            </Protection>}>
            <Route path="home" index element={<Home />} />
            <Route path="profile" element={<Navigate to={`/profile/${user?.username}`} />} />
            <Route path="profile/:username" element={<Profile />} >
                <Route index element={<ProfileInfo />} />
                <Route path="posts" element={<ProfilePosts />} />
            </Route>
            <Route path="settings" element={<Settings />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="search/:content" element={<SearchPage />} />
        </Route>
    );
}