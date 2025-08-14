import React, { createContext, useContext, useEffect, useState } from 'react';

import { GetUser, GetExtra } from '../hooks';
import { axios } from '../config';

interface User {
    id: number;
    username: string;
    full_name: string;
    email: string;
    profileUrl: string,
    email_verified: boolean;
    verified: boolean;
    secret: number;
    role_id: number;
    followers: number;
    following: number;
    followed: boolean; // custom data
    createdAt: Date | string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    isLoggedIn: boolean;
    HasRoleAccess: (minRoleId: number) => boolean;
    RefreshUser: () => Promise<void>;
    UpdateUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const FetchUser = async () => {
        setLoading(true);
        try {
            const [generalData, personalData] = await Promise.all([
                GetUser(),
                GetExtra('')
            ]);

            if (!generalData || !personalData)
                throw new Error('Invalid user data');

            setUser({ ...generalData, ...personalData });
        } catch (_) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    const ResyncUser = async () => {
        setLoading(true);

        try {
            const generalData = await axios.get('/resync-user');
            const refreshed = generalData.data?.user;
            setUser({ ...user, ...refreshed });
        } catch (_) {
        } finally {
            setLoading(false);
        }
    }

    const logout = async () => {
        try {
            await axios.post('logout');
            setUser(null);
        } catch (_) {
            setUser(null);
        }
    }

    useEffect(() => {
        FetchUser();
    }, []);

    const value: UserContextType = {
        user,
        loading,
        isLoggedIn: !!user,
        HasRoleAccess: (minRoleId) => !!user && user.role_id >= minRoleId,
        RefreshUser: FetchUser,
        UpdateUser: ResyncUser,
        logout,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export type { User };