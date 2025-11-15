import type { Post } from "../../../../context/PostContext";
import type { User } from "../../../../context/UserContext";

import { GetTimePast, FormatNumber } from "../../../../utilities/Format";
import { IsMobile } from "../../../../hooks";

import VerifiedIcon from "../../../../assets/verified-check.png";
import SwalUtility from "../../../../utilities/SwalUtility";

import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

interface PostCardLayoutType {
    post: Post;
    user: User;

    isMain: boolean;
    isSelf: boolean;

    actions: {
        AddLike: (id: number) => Promise<void>;
        DeleteItem: (postId: number, fn?: () => void, security_code?: string) => Promise<void>;
        ReportPost: (postId: number) => Promise<void>;
    }
}

export default function PostCardLayout({ post, user, isMain, isSelf, actions }: PostCardLayoutType) {
    const navigate = useNavigate();
    const location = useLocation();

    const isMobile = IsMobile();

    const [isOpen, setOpen] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>("");

    const HandleDeletion = async (postId: number, postOwner: number, fn?: () => void) => {
        let security_code: string = "";

        if (user?.role_id! >= 2 && postOwner !== user?.id) {
            security_code = (await SwalUtility.AskSecurityCode(user?.code))!;
            if (!security_code)
                return;
        }

        await actions.DeleteItem(postId, fn, security_code);
    }

    const OpenImageModal = (imageUrl: string) => {
        setImageUrl(imageUrl);
        setOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const CloseImageModal = () => {
        setOpen(false);
        setImageUrl('');
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="yapper-posts" key={post.postId}>
            <div className="card shadow-sm my-4 rounded-3 border border-2 border-light bg-white">
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
                    <div className={`d-flex mb-4 text-break ${!isMain ? "text-wrap" : ""} ps-3 ms-3 ps-sm-5 ps-md-5`} style={{ paddingLeft: '65px' }}>
                        {post.description}
                    </div>
                    <div>
                        {
                            post.imageUrl && (
                                (isMain || isSelf) ? (
                                    <img src={`/public/${post.imageUrl}`} alt="📎An attachment" onClick={() => OpenImageModal(`/public/${post.imageUrl}`)}
                                        className={`rounded-3 border mx-auto d-${isMobile ? "block" : "flex justify-content-start"}`} role="button"
                                        style={{ height: 'auto', maxWidth: '550px', objectFit: 'cover', width: '100%', maxHeight: '350px' }} />
                                ) : (
                                    <a onClick={() => OpenImageModal(`/public/${post.imageUrl}`)} className="ps-3">🔗 An attachment</a>
                                )
                            )
                        }
                    </div>
                </div>

                {isOpen && (
                    <div className="modal-backdrop-custom position-fixed opacity-100 w-100 h-100 top-0 start-0 d-flex justify-content-center align-items-center"
                        style={{ zIndex: '9999', transition: 'opacity 0.3s ease-in-out', backgroundColor: 'rgba(17, 16, 16, 0.25)' }} onClick={CloseImageModal} >
                        <div className="modal-content-wrapper position-relative">
                            <span role="button" className="close-button position-absolute text-white opacity-75 fs-3 fw-bold top-4 end-4"
                                style={{ zIndex: '10000', transition: 'opacity 0.2s' }} onClick={CloseImageModal}>&times;</span>
                            <img src={imageUrl} alt="View image"
                                className="focused-image" style={{ objectFit: "contain", maxWidth: "90%", maxHeight: "90vh", transform: "scale(1)", animation: "zoomIn 0.3s ease-in-out" }}
                                onClick={(e) => e.stopPropagation()} />
                        </div>
                    </div>
                )}
                <div className="card-footer bg-white">
                    <div className="d-flex align-items-center ms-3 ps-3 ps-sm-5 ps-md-5">
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
    )
}