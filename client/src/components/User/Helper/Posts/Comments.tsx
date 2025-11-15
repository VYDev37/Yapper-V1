import { useNavigate } from "react-router-dom";
import { useState } from "react";

import type { PostComments } from "../../../../context/PostContext";
import type { User } from "../../../../context/UserContext";

import { GetTimePast, FormatNumber } from "../../../../utilities/Format";

import VerifiedIcon from "../../../../assets/verified-check.png";
import SwalUtility from "../../../../utilities/SwalUtility";
import CommentReply from "./Replies";

import { axios } from "../../../../config";

interface CommentParams {
    comment: PostComments;
    user: User;
    postOwner: number;

    HandleReply: (commentOwner: string, commentId: number) => void;
    ReportPost: (postId: number, commentId?: number | null) => Promise<void>;
    LikeComment: (postId: number, commentId: number, isReply: boolean) => Promise<void>;
    FetchPost: (search?: string, username?: string) => Promise<void>;
}

export default function Comments({ comment, user, postOwner, HandleReply, ReportPost, LikeComment, FetchPost }: CommentParams) {
    const [opened, setOpened] = useState<boolean>(false);
    const [revealed, setRevealed] = useState<boolean>(false);

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

                const result = await axios.post(`delete-comment/${commentId}/${postId}`);
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
        <div className="d-flex align-items-start py-2 flex-shrink px-2" id={`${comment.id}`}>
            <img src={`/public/profile-pics/${comment.profileUrl}`} role="button" onClick={() => navigate(`/profile/${comment.username}`)} alt="profile" className="rounded-circle me-3" width="40" height="40" />
            <div className="flex-grow-1">
                <div className="mb-1 text-break text-wrap">
                    <div className="d-flex align-items-center">
                        <strong style={{ color: comment.role_id >= 2 ? "goldenrod" : "inherit" }} role="button" onClick={() => navigate(`/profile/${comment.username}`)}>{comment.username}
                            {comment.userId === postOwner && (
                                <span className="text-muted" style={{ fontSize: '14px', fontWeight: 'normal' }}> • Creator</span>
                            )}
                        </strong>

                        {comment.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle ms-1" style={{ height: '20px', marginTop: '3px' }} />)}
                    </div>
                    <div className="d-flex flex-column">
                        {comment.blocked && !revealed ? (
                            <span className="text-muted" style={{ fontSize: '14px' }}>
                                Comment content is hidden as you blocked this user. Click <a className="text-blue text-decoration-underline" role="button" onClick={() => setRevealed(!revealed)}>here</a> to view the message.
                            </span>
                        ) : comment.comment}
                        {revealed && (
                            <span className="text-muted" style={{ fontSize: '14px' }}>
                                Comment content is hidden as you blocked this user. Click <a className="text-blue text-decoration-underline" role="button" onClick={() => setRevealed(!revealed)}>here</a> to hide the message.
                            </span>
                        )}
                    </div>
                </div>
                <div className="d-flex gap-3 text-muted small">
                    <span>{GetTimePast(comment.createdAt, true)}</span>
                    <a role="button" className="text-decoration-none text-muted"
                        onClick={() => HandleReply(comment.username, comment.id)}>Reply</a>
                    <a role="button" className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
                        onClick={() => ReportPost(comment.postId, comment.id)}>Report</a>
                    {(user.id === comment.userId || user.role_id >= 2 || user.id === postOwner) && (
                        <a role="button" onClick={(e) => RemoveComment(e, comment.id, comment.postId)} className="text-decoration-none text-danger">Delete</a>
                    )}
                </div>
                {comment.replyCount > 0 && (<button className="btn btn-link btn-sm text-muted ps-0 mt-2 text-decoration-none"
                    data-bs-toggle="collapse" data-bs-target="#replies-1"
                    aria-expanded="false" aria-controls="replies-1" onClick={() => setOpened(!opened)}>
                    {opened ? "Hide replies" : `View replies (${FormatNumber(comment.replyCount)})`}
                </button>)}

                {opened && (
                    <div className="mt-2 ps-3 border-start">
                        {comment.replies.map((r) => (
                            <CommentReply reply={r} postOwner={postOwner} user={user}
                                actions={{ HandleReply, ReportPost, LikeComment, RemoveComment }} />
                        ))}
                    </div>
                )}
            </div>
            <button className="btn btn-sm p-0 me-3 border-0 bg-transparent text-muted">
                <div className="d-flex flex-column">
                    <i className={`fas fa-heart text-${comment.liked ? "danger" : "white"} mb-1`}
                        style={{ WebkitTextStroke: comment.liked ? '' : '1px black' }} onClick={() => LikeComment(comment.postId, comment.id, false)}></i>
                    <span className="px-1">{FormatNumber(comment.likeCount)}</span>
                </div>
            </button>
        </div>
    );
}