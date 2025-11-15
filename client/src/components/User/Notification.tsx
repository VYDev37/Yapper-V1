import React from "react";
import { useNavigate } from "react-router-dom";

import { GetTimePast, Truncate } from "../../utilities/Format";
import { axios } from "../../config";

interface NotificationObj {
    id: number;
    postOwner: number;
    postId: number;
    commentId: number;
    action: string;
    profileUrl: string;
    postDescription: string;
    postAttachment: string;
    username: string;
    verified: boolean;
    isRead: boolean;
    createdAt: Date;
}

export default function Notification() {
    const [notifications, setNotifications] = React.useState<NotificationObj[]>([]);
    const navigate = useNavigate();

    const HandleNavigation = async (id: number, postOwner: number | null, postId: number | null, commentId: number | null) => {
        if (!postId || !postOwner)
            return;

        await axios.put(`read-notification/${id}`);
        window.location.replace(`/post/${postOwner}/${postId}${commentId ? `#${commentId}` : ""}`);
    }

    React.useEffect(() => {
        const fn = async () => {
            try {
                const response = await axios.get('/get-notifications');
                setNotifications(response.data.notifications);
            } catch (err) {
                console.log(err);
                setNotifications([]);
            }
        }

        fn();
    }, []);

    return (
        <div className="container-fluid notification-container">
            <h3 className="pt-4 fw-bold mb-5">Notifications</h3>
            {
                notifications.length > 0 ?
                    notifications.map(notification => (
                        <div className="card my-3 shadow-sm border-0" onClick={() => HandleNavigation(notification.id, notification.postOwner, notification.postId, notification.commentId)}>
                            <div className="card-body d-flex align-items-start">
                                <div className="me-3 text-danger">
                                    <i className="bi bi-heart-fill fs-4"></i>
                                </div>
                                <img src={`/public/profile-pics/${notification.profileUrl}`} onClick={() => navigate(`/profile/${notification.username}`)} alt="" className="rounded-circle me-3" style={{ height: '50px', width: '50px', minHeight: '50px', minWidth: '50px', objectFit: 'cover' }} />
                                <div>
                                    <p className="mb-1" onClick={() => navigate(`/profile/${notification.username}`)}><strong>{notification.username}</strong> {notification.action}</p>
                                    {notification.postDescription && (
                                        <>
                                            <small className="text-muted">"{Truncate(notification.postDescription, 30)}"</small><br />
                                        </>
                                    )}
                                    {notification.createdAt && (
                                        <small className="text-muted">{GetTimePast(notification.createdAt)}</small>
                                    )}
                                </div>
                                {notification.postAttachment && (
                                    <img src={`/public/${notification.postAttachment}`} alt="" className="ms-auto rounded-0 me-3" style={{ height: '80px', width: '80px', minHeight: '80px', minWidth: '80px', objectFit: 'cover' }} />
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="d-flex justify-content-center">
                            <h3>You have no any notification for now.</h3>
                        </div>
                    )
            }

        </div>
    );
}