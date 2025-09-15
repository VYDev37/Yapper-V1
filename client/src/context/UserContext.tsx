import { createContext, useContext, useEffect, useState } from 'react';

import { GetUser, GetExtra } from '../hooks';
import { axios } from '../config';

import SwalUtility from '../utilities/SwalUtility';

interface User {
    id: number;
    username: string;
    full_name: string;
    email: string;
    profileUrl: string;
    ban_reason: string | null;
    email_verified: boolean;
    verified: boolean;
    secret: number;
    role_id: number;
    followers: number;
    following: number;
    // custom states begins
    followed: boolean;
    blocked: boolean;
    // custom states end
    createdAt: Date | string;
    banned_until: Date | null;
    code: string;
}

interface UserContextType {
    user: User | null;
    socket: WebSocket | undefined;
    loading: boolean;
    isLoggedIn: boolean;

    HasRoleAccess: (minRoleId: number) => boolean;
    RefreshUser: () => Promise<void>;
    UpdateUser: () => Promise<void>;
    ReportUser: (userId: number) => Promise<void>;
    Logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [socket, setSocket] = useState<WebSocket>();
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

    const ReportUser = async (userId: number) => {
        const result = await SwalUtility.SendInputDialog("Report User", "Please input the reason for your report.", "text", "OK");
        const val = result.value.trim();

        if (val) {
            try {
                const res = await axios.post('/add-report/user', { userId, reason: val });
                if (res.status === 200)
                    SwalUtility.SendMessage("Success", res.data.message, "success");
            } catch (err: any) {
                SwalUtility.SendMessage("Failed", err.message, "error");
            }
        }
    }

    const Logout = async () => {
        try {
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

            setUser(null);
        } catch (_) {
            setUser(null);
        }
    }

    useEffect(() => {
        FetchUser();
    }, []);

    useEffect(() => {
        const fn = async () => {
            if (!user)
                return;

            const ws = new WebSocket(`ws://${window.location.hostname}:1337`);
            setSocket(ws);

            ws.onopen = () => console.log("✅ Connected to WebSocket");
            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                if (data.action === "logout") {
                    await SwalUtility.SendMessage("Warning", `You've been kicked out from the server due to ban applied. (Reason: ${data.reason || "None."})`, "info");
                    //console.log("🚪 Server requested logout");
                    await axios.post('/logout');
                    window.location.href = "/login";
                }
            };

            ws.onclose = () => {
                console.log("🔌 WebSocket closed");
            };

            return () => {
                ws.close();
            };
        }

        fn();
    }, [user]);

    const value: UserContextType = {
        user,
        socket,
        loading,
        isLoggedIn: !!user,
        HasRoleAccess: (minRoleId) => !!user && user.role_id >= minRoleId,
        RefreshUser: FetchUser,
        UpdateUser: ResyncUser,
        ReportUser,
        Logout,
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