import { useNavigate, useLocation } from "react-router-dom";

import VerifiedIcon from '../../../../assets/verified-check.png';
import { FormatNumber, GetTimePast } from "../../../../utilities/Format";
import SwalUtility from "../../../../utilities/SwalUtility";

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
    const location = useLocation();

    const HandleDeletion = async (postId: number, postOwner: number, fn?: () => void) => {
        let security_code: string = "";

        if (user?.role_id! >= 2 && postOwner !== user?.id) {
            security_code = (await SwalUtility.AskSecurityCode(user?.code))!;
            if (!security_code)
                return;
        }

        await actions.DeleteItem(postId, fn, security_code);
    }

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
                            <div className="yapper-posts" key={post.postId}>
                                <div className="card shadow-sm my-4 rounded-2 bg-white">
                                    {/* Post header */}
                                    <div className="card-header mt-1 border-bottom-0 rounded-4 bg-white">
                                        <div className="d-flex justify-content-between">
                                            <div className="d-flex align-items-center text-break text-wrap" onClick={() => navigate(`/profile/${post.username}`)}>
                                                <img src={`/public/profile-pics/${post.profileUrl}`} alt="" className="rounded-circle" style={{ height: '50px', width: '50px', minHeight: '50px', minWidth: '50px', objectFit: 'cover' }} />
                                                <div className="ps-3">
                                                    <div className="d-flex align-items-center">
                                                        <span className={`fw-semibold fs-${!isMain && !isSelf ? "6" : "5"}`}>{post.full_name}</span>
                                                        {
                                                            post.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle pt-1" style={{ paddingLeft: '4px', height: '25px' }} />)
                                                        }
                                                    </div>
                                                    <div className="text-muted fs-6">
                                                        <span style={{ color: post.role_id >= 2 ? 'goldenrod' : 'inherit', fontWeight: '500' }}>(@{post.username})</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {(isMain || isSelf) && (
                                                <span className="text-muted fs-6">{GetTimePast(post.createdAt)}</span>
                                            )}
                                        </div>

                                    </div>
                                    <div className="card-body">
                                        {/* Post content */}
                                        <div className={`d-flex mb-4 text-break ${!isMain ? "text-wrap" : ""}`} style={{ paddingLeft: 'calc(115px - 50px)' }}>
                                            {post.description}
                                        </div>
                                        {
                                            post.imageUrl && (
                                                (isMain || isSelf) ? (
                                                    <img src={`/public/${post.imageUrl}`} alt="" className="rounded-0"
                                                        style={{
                                                            marginLeft: 'calc(115px - 50px)', marginRight: 'calc(115px - 50px)',
                                                            height: '350px', width: '350px', objectFit: 'cover'
                                                        }} />
                                                ) : (
                                                    <a href={`/public/${post.imageUrl}`}>🔗 An attachment</a>
                                                )
                                            )
                                        }
                                    </div>
                                    <div className="card-footer bg-white">
                                        <div className="d-flex align-items-center" style={{ paddingLeft: '65px' }}>
                                            <div>
                                                <i className={`fas fa-heart text-${post.liked ? "danger" : "white"}`}
                                                    style={{ WebkitTextStroke: post.liked ? '' : '1px black' }} onClick={() => actions.AddLike(post.postId)}></i>
                                                <span className="px-1">{FormatNumber(post.likeCount)}</span>
                                            </div>
                                            <div className="ms-3">
                                                <i className="fas fa-comment text-white"
                                                    style={{ WebkitTextStroke: '1px black' }} onClick={() => navigate(`/post/${post.ownerId}/${post.postId}`, {
                                                        state: { backgroundLocation: location }
                                                    })}></i>
                                                <span className="px-1">{FormatNumber(post.commentCount)}</span>
                                            </div>
                                            {user?.id !== post?.ownerId && (
                                                <div className="ms-3" onClick={() => actions.ReportPost(post?.postId)}>
                                                    <i className="fas fa-triangle-exclamation"></i>
                                                    <span className="px-1">Report</span>
                                                </div>
                                            )}
                                            {(user?.role_id! >= 2 || user?.id === post?.ownerId) && (
                                                <div className="ms-3 text-danger" onClick={() => HandleDeletion(post?.postId, post?.ownerId)}>
                                                    <i className="fas fa-trash"></i>
                                                    <span className="px-1">Delete</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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