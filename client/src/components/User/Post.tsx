import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { axios } from "../../config";
import VerifiedIcon from "../../assets/verified-check.png";

import type { Post } from "../../context/PostContext";
import { usePosts } from "../../context/PostContext";
import { useUser } from "../../context/UserContext";

import { GetTimePast, FormatNumber } from "../../utilities/Format";
import SwalUtility from "../../utilities/SwalUtility";

export default function Post({ modal = false }) {
    const { ownerId, id } = useParams();
    const { AddLike, DeleteItem, loading, posts, FetchPost } = usePosts();
    const { user } = useUser();

    const navigate = useNavigate();
    const location = useLocation();

    const [comment, setComment] = useState<string>('');

    const CloseModal = () => {
        if (location.state?.backgroundLocation) {
            navigate(-1);
        } else {
            navigate("/");
        }
    }

    const AddComment = async (e: React.FormEvent, postId: number) => {
        e.preventDefault();

        try {
            if (!comment || comment?.trim() === '') {
                SwalUtility.SendMessage("Error", "Please fill the comment.", "error");
                return;
            }
            const result = await axios.post("add-comment", { comment, postId });
            if (result.status === 200) {
                SwalUtility.SendMessage("Success", result.data.message, "success");
                FetchPost();
            } else {
                SwalUtility.SendMessage("Error", result.data.message, "error");
            }
        } catch (error) {
            SwalUtility.SendMessage("Error", "Failed to add comment. Please try again later.", "error");
        }
    }

    const RemoveComment = async (e: React.FormEvent, commentId: number, postId: number) => {
        e.preventDefault();

        const res = await SwalUtility.SendConfirmationDialog("Are you sure", "You want to delete this comment.", "Delete");
        if (res.isConfirmed) {
            try {
                if (!commentId || !postId) {
                    SwalUtility.SendMessage("Error", "Failed to delete comment. Please try again later.", "error");
                    return;
                }

                const result = await axios.delete(`delete-comment/${commentId}/${postId}`);
                if (result.status === 200) {
                    SwalUtility.SendMessage("Success", result.data.message, "success");
                    FetchPost();
                } else {
                    SwalUtility.SendMessage("Error", result.data.message, "error");
                }
            } catch (error) {
                SwalUtility.SendMessage("Error", "Failed to add comment. Please try again later.", "error");
            }
        }

    }

    const post: Post | undefined = posts.find(p => p.postId === +id! && p.ownerId === +ownerId!);

    if (loading || !post || !user)
        return <div>Loading...</div>

    return (
        <div style={{
            position: modal ? "fixed" : "relative", top: modal ? "50%" : "0", left: modal ? "50%" : "0",
            transform: modal ? "translate(-50%, -50%)" : "none", background: "white", padding: "20px", borderRadius: modal ? "12px" : "0",
            width: modal ? "800px" : "100%", height: modal ? "600px" : "100%", boxShadow: modal ? "0 0 20px rgba(0,0,0,0.3)" : "none",
            overflowY: modal ? "auto" : "visible", zIndex: modal ? 1000 : "auto", overflowX: "hidden", display: "flex", flexDirection: "column"
        }}>
            <div className="modal-header justify-content-center position-relative">
                <h3 className="m-0">Post of {post.username}</h3>
                {modal && (
                    <button className="btn-close position-absolute" style={{ right: "15px" }} onClick={CloseModal} />
                )}
            </div>
            <hr />
            <div className="modal-body flex-grow-1" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
                {/* Post side */}
                <div className="card rounded-0 p-0">
                    <div className="card-body mt-1 border-bottom-0 rounded-4 bg-white">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex align-items-center text-break text-wrap" onClick={() => navigate(`/profile/${post.username}`)}>
                                <img src={`/public/profile-pics/${post.profileUrl}`} alt="" className="rounded-circle" style={{ height: '50px', width: '50px', minHeight: '50px', minWidth: '50px', objectFit: 'cover' }} />
                                <div className="ps-3">
                                    <div className="d-flex align-items-center">
                                        <span className={"fw-semibold fs-5"}>{post.full_name}</span>
                                        {
                                            post.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle pt-1" style={{ paddingLeft: '4px', height: '25px' }} />)
                                        }
                                    </div>
                                    <div className="text-muted fs-6">
                                        <span style={{ color: post.role_id >= 2 ? 'goldenrod' : 'inherit', fontWeight: '500' }}>(@{post.username})</span>
                                    </div>
                                </div>
                            </div>
                            {post.createdAt && (<span className="text-muted fs-6">{GetTimePast(post.createdAt)}</span>)}
                        </div>
                        <div className="post-body">
                            <div className="d-flex my-4 text-break text-wrap" style={{ paddingLeft: 'calc(115px - 50px)' }}>
                                {post.description}
                            </div>
                            {
                                post.imageUrl && (
                                    <img src={`/public/${post.imageUrl}`} alt="" className="rounded-0"
                                        style={{
                                            marginLeft: 'calc(115px - 50px)', marginRight: 'calc(115px - 50px)',
                                            height: '350px', width: '350px', objectFit: 'cover'
                                        }} />
                                )
                            }
                        </div>
                    </div>
                    <div className="card-footer bg-white">
                        { /* Like, comment, etc box here. (Imported from PostCard.tsx) */}
                        <div className="d-flex align-items-center" style={{ paddingLeft: '65px' }}>
                            <div>
                                <i className={`fas fa-heart text-${post.liked ? "danger" : "white"}`}
                                    style={{ WebkitTextStroke: post.liked ? '' : '1px black' }} onClick={() => AddLike(post.postId)}></i>
                                <span className="px-1">{FormatNumber(post.likeCount)}</span>
                            </div>
                            <div className="ms-3">
                                <i className="fas fa-comment text-white" style={{ WebkitTextStroke: '1px black' }}></i>
                                <span className="px-1">{FormatNumber(post.commentCount)}</span>
                            </div>
                            {user.id !== post.ownerId && (
                                <div className="ms-3">
                                    <i className="fas fa-triangle-exclamation"></i>
                                    <span className="px-1">Report</span>
                                </div>
                            )}
                            {(user.role_id >= 2 || user.id === post.ownerId) && (
                                <div className="ms-3 text-danger" onClick={() => DeleteItem(post?.postId, CloseModal)}>
                                    <i className="fas fa-trash"></i>
                                    <span className="px-1">Delete</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Comments section here */}
                {
                    post.comments?.map(comment => (
                        <div className="card shadow-sm my-4 rounded-2 bg-white" key={comment.id}>
                            {/* Post header */}
                            <div className="card-header mt-1 border-bottom-0 rounded-4 bg-white">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center text-break text-wrap" onClick={() => navigate(`/profile/${comment.username}`)}>
                                        <img src={`/public/profile-pics/${comment.profileUrl}`} alt="" className="rounded-circle mt-1" style={{ height: '40px', width: '40px', minHeight: '40px', minWidth: '40px', objectFit: 'cover' }} />
                                        <div className="ps-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <span className="fw-semibold fs-5">{comment.full_name}</span>
                                                {
                                                    comment.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle pt-1" style={{ paddingLeft: '4px', height: '25px' }} />)
                                                }
                                            </div>

                                        </div>
                                    </div>
                                    {comment.createdAt && (
                                        <span className="text-muted fs-6">{GetTimePast(comment.createdAt)}</span>
                                    )}
                                </div>

                            </div>
                            <div className="card-body">
                                {/* Post content */}
                                <div className="d-flex">
                                    <div style={{ width: "58px" }}></div>
                                    <div className="text-break text-wrap fs-6">{comment.comment}</div>
                                </div>
                            </div>
                            <div className="card-footer bg-white">
                                <div className="d-flex align-items-center" style={{ paddingLeft: '55px' }}>
                                    <div>
                                        <i className={`fas fa-heart text-${post.liked ? "danger" : "white"}`}
                                            style={{ WebkitTextStroke: post.liked ? '' : '1px black' }} onClick={() => AddLike(post.postId)}></i>
                                        <span className="px-1">{FormatNumber(0)}</span> {/* Will be implemented later*/}
                                    </div>
                                    <div className="ms-3">
                                        <i className="fas fa-comment text-white"
                                            style={{ WebkitTextStroke: '1px black' }}></i> {/* onClick={() => navigate(`/post/${post.ownerId}/${post.postId}`, {
                                                state: { backgroundLocation: location }
                                            })} */}
                                        <span className="px-1">{FormatNumber(0)}</span> {/* Will be implemented later*/}
                                    </div>
                                    {user?.id !== post?.ownerId && (
                                        <div className="ms-3">
                                            <i className="fas fa-triangle-exclamation"></i>
                                            <span className="px-1">Report</span>
                                        </div>
                                    )}
                                    {(user?.role_id! >= 2 || user?.id === post?.ownerId) && (
                                        <div className="ms-3 text-danger" onClick={(e) => RemoveComment(e, comment.id, post.postId)}>
                                            <i className="fas fa-trash"></i>
                                            <span className="px-1">Delete</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="modal-footer position-sticky bottom-0 border-top bg-white p-2">
                <form className="d-flex align-items-center w-100">
                    <img src={`/public/profile-pics/${user.profileUrl}`} alt="" className="rounded-circle me-3" style={{ height: '40px', width: '40px', objectFit: 'cover' }} />
                    <textarea placeholder="Enter your comment here..." onChange={(e) => setComment(e.target.value)} className="form-control p-2" style={{ width: '600px' }} required />
                    <button className="btn btn-yapper round-30 ms-3 px-3" style={{ width: '100px', height: '40px' }} onClick={(e) => AddComment(e, post.postId)}>Comment</button>
                </form>
            </div>
        </div>
    );
}
