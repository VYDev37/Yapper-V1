import { useNavigate } from "react-router-dom";
import { useState } from "react";

import type { PostComments } from "../../../../context/PostContext";
import type { User } from "../../../../context/UserContext";

import { GetTimePast, FormatNumber } from "../../../../utilities/Format";

import VerifiedIcon from "../../../../assets/verified-check.png";
import SwalUtility from "../../../../utilities/SwalUtility";
import { axios } from "../../../../config";

interface CommentParams {
    comment: PostComments;
    user: User;
    postOwner: number;

    HandleReply: (commentOwner: string, commentId: number) => void;
    LikeComment: (postId: number, commentId: number, isReply: boolean) => Promise<void>;
    FetchPost: (search?: string, username?: string) => Promise<void>;
}

export default function Comments({ comment, HandleReply, postOwner, user, LikeComment, FetchPost }: CommentParams) {
    const [opened, setOpened] = useState<boolean>(false);
    const navigate = useNavigate();

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

    return (
        <div className="d-flex align-items-start py-2 flex-shrink">
            <img src={`/public/profile-pics/${comment.profileUrl}`} role="button" onClick={() => navigate(`/profile/${comment.username}`)} alt="profile" className="rounded-circle me-3" width="40" height="40" />
            <div className="flex-grow-1">
                <div className="mb-1 text-break text-wrap">
                    <div className="d-flex align-items-center">
                        <strong style={{ color: user.role_id >= 2 ? "goldenrod" : "inherit" }} role="button" onClick={() => navigate(`/profile/${comment.username}`)}>{comment.username}</strong>
                        {comment.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle ms-1" style={{ height: '20px', marginTop: '3px' }} />)}
                    </div>
                    {comment.comment}
                </div>
                <div className="d-flex gap-3 text-muted small">
                    <span>{GetTimePast(comment.createdAt, true)}</span>
                    <a role="button" className="text-decoration-none text-muted"
                        onClick={() => HandleReply(comment.username, comment.id)}>Reply</a>
                    {(user.id === comment.userId || user.role_id >= 2 || user.id === postOwner) && (
                        <a role="button" onClick={(e) => RemoveComment(e, comment.id, comment.postId)} className="text-decoration-none text-danger">Delete</a>
                    )}
                </div>
                {comment.replyCount > 0 && (<button className="btn btn-link btn-sm text-muted ps-0 mt-2"
                    data-bs-toggle="collapse" data-bs-target="#replies-1"
                    aria-expanded="false" aria-controls="replies-1" onClick={() => setOpened(!opened)}>
                    {opened ? "Hide replies" : `View replies (${FormatNumber(comment.replyCount)})`}
                </button>)}

                {opened && (
                    <div className="mt-2 ps-3 border-start">
                        {comment.replies.map((r) => (
                            <div key={r.id} className="d-flex align-items-start py-2">
                                <img src={`/public/profile-pics/${r.profileUrl}`} alt="" className="rounded-circle me-3" width="40" height="40" />
                                <div className="flex-grow-1">
                                    <div className="mb-1 text-break text-wrap">
                                        <div className="d-flex align-items-center">
                                            <strong style={{ color: r.role_id >= 2 ? "goldenrod" : "inherit" }} role="button" onClick={() => navigate(`/profile/${comment.username}`)}>{comment.username}</strong>
                                            {r.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle ms-1" style={{ height: '20px', marginTop: '3px' }} />)}
                                        </div>
                                        {r.comment}
                                    </div>
                                    <div className="d-flex gap-3 text-muted small">
                                        <span>{GetTimePast(r.createdAt, true)}</span>
                                        <button type="button" className="btn btn-link btn-sm text-muted p-0" onClick={() => HandleReply(r.username, r.id)}>
                                            Reply
                                        </button>
                                        {(user.id === r.userId || user.role_id >= 2 || user.id === postOwner) && (
                                            <a role="button" onClick={(e) => RemoveComment(e, r.id, r.postId)} className="text-decoration-none text-danger">Delete</a>
                                        )}
                                    </div>
                                </div>
                                <button className="btn btn-sm p-0 ms-2 border-0 bg-transparent text-muted">
                                    <div className="d-flex flex-column">
                                        <i className={`fas fa-heart text-${r.liked ? "danger" : "white"} mb-1`}
                                            style={{ WebkitTextStroke: r.liked ? '' : '1px black' }} onClick={() => LikeComment(r.postId, r.id, true)}></i>
                                        <span className="px-1">{FormatNumber(r.likeCount)}</span>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button className="btn btn-sm p-0 ms-2 border-0 bg-transparent text-muted">
                <div className="d-flex flex-column">
                    <i className={`fas fa-heart text-${comment.liked ? "danger" : "white"} mb-1`}
                        style={{ WebkitTextStroke: comment.liked ? '' : '1px black' }} onClick={() => LikeComment(comment.postId, comment.id, false)}></i>
                    <span className="px-1">{FormatNumber(comment.likeCount)}</span>
                </div>
            </button>
        </div>
    );
}