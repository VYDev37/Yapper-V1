import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { PostComments } from "../../../../context/PostContext";
import type { User } from "../../../../context/UserContext";

import { FormatNumber, GetTimePast } from "../../../../utilities/Format";

import VerifiedIcon from "../../../../assets/verified-check.png";

interface ReplyParams {
    reply: PostComments;
    user: User;
    postOwner: number;

    actions: {
        HandleReply: (commentOwner: string, commentId: number) => void;
        ReportPost: (postId: number, commentId?: number | null) => Promise<void>;
        LikeComment: (postId: number, commentId: number, isReply: boolean) => Promise<void>;
        RemoveComment: (e: React.FormEvent, commentId: number, postId: number) => Promise<void>;
    }
}

export default function CommentReply({ reply, user, postOwner, actions }: ReplyParams) {
    const [revealed, setRevealed] = useState<boolean>(false);
    const navigate = useNavigate();

    return (
        <div key={reply.id} className="d-flex align-items-start py-2">
            <img src={`/public/profile-pics/${reply.profileUrl}`} alt="" className="rounded-circle me-3" width="40" height="40" />
            <div className="flex-grow-1">
                <div className="mb-1 text-break text-wrap">
                    <div className="d-flex align-items-center">
                        <strong style={{ color: reply.role_id >= 2 ? "goldenrod" : "inherit" }} role="button" onClick={() => navigate(`/profile/${reply.username}`)}>{reply.username}
                            {reply.userId === postOwner && (
                                <span className="text-muted" style={{ fontSize: '14px', fontWeight: 'normal' }}> • Creator</span>
                            )}
                        </strong>
                        {reply.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle ms-1" style={{ height: '20px', marginTop: '3px' }} />)}
                    </div>
                    <div className="d-flex flex-column">
                        {reply.blocked && !revealed ? (
                            <span className="text-muted" style={{ fontSize: '14px' }}>
                                Comment content is hidden as you blocked this usereply. Click <a className="text-blue text-decoration-underline" role="button" onClick={() => setRevealed(!revealed)}>here</a> to view the message.
                            </span>
                        ) : reply.comment}
                        {revealed && (
                            <span className="text-muted" style={{ fontSize: '14px' }}>
                                Comment content is hidden as you blocked this usereply. Click <a className="text-blue text-decoration-underline" role="button" onClick={() => setRevealed(!revealed)}>here</a> to hide the message.
                            </span>
                        )}
                    </div>
                </div>
                <div className="d-flex gap-3 text-muted small">
                    <span>{GetTimePast(reply.createdAt, true)}</span>
                    <a role="button" className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
                        onClick={() => actions.HandleReply(reply.username, reply.id)}>Reply</a>
                    <a role="button" className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
                        onClick={() => actions.ReportPost(reply.postId, reply.id)}>Report</a>
                    {(user.id === reply.userId || user.role_id >= 2 || user.id === postOwner) && (
                        <a role="button" onClick={(e) => actions.RemoveComment(e, reply.id, reply.postId)} className="text-decoration-none text-danger">Delete</a>
                    )}
                </div>
            </div>
            <button className="btn btn-sm p-0 ms-2 border-0 bg-transparent text-muted">
                <div className="d-flex flex-column">
                    <i className={`fas fa-heart text-${reply.liked ? "danger" : "white"} mb-1`}
                        style={{ WebkitTextStroke: reply.liked ? '' : '1px black' }} onClick={() => actions.LikeComment(reply.postId, reply.id, true)}></i>
                    <span className="px-1">{FormatNumber(reply.likeCount)}</span>
                </div>
            </button>
        </div>
    )
}