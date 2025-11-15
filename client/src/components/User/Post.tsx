import { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { axios } from "../../config";

import type { Post } from "../../context/PostContext";
import { usePosts } from "../../context/PostContext";
import { useUser } from "../../context/UserContext";

import SwalUtility from "../../utilities/SwalUtility";

import Comments from "./Helper/Posts/Comments";
import PostCardLayout from "./Helper/Posts/PostCardLayout";

export default function Post({ modal = false }) {
    const { ownerId, id } = useParams();
    const { AddLike, DeleteItem, FetchPost, LikeComment, ReportPost, loading, posts } = usePosts();
    const { user } = useUser();

    const navigate = useNavigate();
    const location = useLocation();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const [comment, setComment] = useState<string>('');
    const [parentId, setParentId] = useState<number | null>(null);

    const CloseModal = () => {
        if (location.state?.backgroundLocation) {
            navigate(-1);
        } else {
            navigate("/");
        }
    }

    const isSelf = user?.id === ownerId;

    const HandleReply = (commentOwner: string, commentId: number) => {
        setComment(`@${commentOwner} ${comment}`);
        setParentId(commentId);
        textareaRef.current?.focus();
    }

    const AddComment = async (e: React.FormEvent, postId: number) => {
        e.preventDefault();

        try {
            if (!comment || comment?.trim() === '') {
                SwalUtility.SendMessage("Error", "Please fill the comment.", "error");
                return;
            }
            const result = await axios.post("add-comment", { comment, postId, parentId });
            if (result.status === 200) {
                //SwalUtility.SendMessage("Success", result.data.message, "success");
                setParentId(null);
                setComment('');
                FetchPost();
            } else {
                SwalUtility.SendMessage("Error", result.data.message, "error");
            }
        } catch (error) {
            SwalUtility.SendMessage("Error", "Failed to add comment. Please try again later.", "error");
        }
    }

    const post: Post | undefined = posts.find(p => p.postId === +id! && p.ownerId === +ownerId!);

    if (loading || !post || !user)
        return <div>Loading...</div>

    return (
        <div style={{
            position: modal ? "fixed" : "relative", top: modal ? "50%" : "0", left: modal ? "50%" : "0",
            transform: modal ? "translate(-50%, -50%)" : "none", background: "white", padding: "10px", borderRadius: modal ? "12px" : "0",
            height: modal ? "90vh" : "100%", width: modal ? "95%" : "100%", maxWidth: modal ? "800px" : "100%", maxHeight: modal ? "600px" : "100%", boxShadow: modal ? "0 0 20px rgba(0,0,0,0.3)" : "none",
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
                <PostCardLayout post={post} user={user} isMain={true} isSelf={isSelf} actions={{ AddLike, DeleteItem, ReportPost }} />
                <hr className="my-5" />
                {/* Comments section here */}
                {
                    post.comments?.map(comment => (
                        <Comments comment={comment} key={comment.id} ReportPost={ReportPost} postOwner={post.ownerId} HandleReply={HandleReply} user={user} LikeComment={LikeComment} FetchPost={FetchPost} />
                    ))
                }
            </div>
            <div className="modal-footer position-sticky bottom-0 border-top bg-white p-2">
                <form className="d-flex align-items-center w-100">
                    <img src={`/public/profile-pics/${user.profileUrl}`} alt="" className="rounded-circle me-3" style={{ height: '40px', width: '40px', objectFit: 'cover' }} />
                    <textarea ref={textareaRef} placeholder="Enter your comment here..." value={comment}
                        onChange={(e) => {
                            const val = e.target.value;
                            setComment(val);

                            if (val.trim() === '')
                                setParentId(null);
                        }} className="form-control p-2" style={{ width: modal ? '600px' : '1000px' }} required />
                    <button className="btn btn-yapper round-30 ms-3 px-3" style={{ width: '100px', height: '40px' }} onClick={(e) => AddComment(e, post.postId)}>Comment</button>
                </form>
            </div>
        </div>
    );
}
