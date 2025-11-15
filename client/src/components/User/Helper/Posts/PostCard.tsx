import { useNavigate } from "react-router-dom";

import VerifiedIcon from '../../../../assets/verified-check.png';
import PostCardLayout from "./PostCardLayout";

import type { Post } from '../../../../context/PostContext';
import type { User } from "../../../../context/UserContext";

interface PostCardProps {
    displayedPosts: Post[];
    isMain: boolean;
    actions: {
        AddLike: (id: number) => Promise<void>;
        DeleteItem: (postId: number, fn?: () => void, security_code?: string) => Promise<void>;
        ReportPost: (postId: number) => Promise<void>;
    }
    user: User;
    users: User[];
    isSelf: boolean;
    isSearchingUser?: boolean;
}

export default function PostCard({ displayedPosts, isMain, actions, user, isSelf, isSearchingUser, users }: PostCardProps) {
    const navigate = useNavigate();

    return (
        <>
            <div>
                {
                    isSearchingUser && users.map(user => (
                        <div className="yapper-related-users" key={user.id}>
                            <div className="card shadow-sm my-4 rounded-2 bg-white">
                                {/* User Card header */}
                                <div className="card-header mt-2 border-bottom-0 rounded-4 bg-white">
                                    <div className="d-flex justify-content-between">
                                        <div className="d-flex align-items-center text-break text-wrap" onClick={() => navigate(`/profile/${user.username}`)}>
                                            <img src={`/public/profile-pics/${user.profileUrl}`} alt="" className="rounded-circle" style={{ height: '50px', width: '50px', minHeight: '50px', minWidth: '50px', objectFit: 'cover' }} />
                                            <div className="ps-3">
                                                <div className="d-flex align-items-center">
                                                    <span className="fw-semibold fs-5">{user.full_name}</span>
                                                    {
                                                        user.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle pt-1" style={{ paddingLeft: '4px', height: '25px' }} />)
                                                    }
                                                </div>
                                                <div className="text-muted fs-6">
                                                    <span style={{ color: user.role_id >= 2 ? 'goldenrod' : 'inherit', fontWeight: '500' }}>(@{user.username})</span>
                                                </div>
                                            </div>
                                        </div>
                                        <a onClick={() => navigate(`/profile/${user.username}`)} className="btn btn-yapper rounded-30" style={{ width: '60px', height: '40px', marginTop: '10px' }}>Visit</a>
                                    </div>

                                </div>
                                <div className="card-body">
                                    {/* Coming soon */}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div>
                {
                    displayedPosts.length > 0 ?
                        displayedPosts.map(post => (
                            <PostCardLayout post={post} user={user} isMain={isMain} isSelf={isSelf} actions={{ 
                                AddLike: actions.AddLike, 
                                DeleteItem: actions.DeleteItem, 
                                ReportPost: actions.ReportPost 
                            }} />
                        )) : (!isSearchingUser && (
                            <div className="d-flex justify-content-center align-items-center vh-100" style={{ paddingBottom: '120px' }}>
                                <h3>No content found.</h3>
                            </div>
                        ))
                }
            </div>
        </>
    );
}