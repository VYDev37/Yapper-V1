import React from "react";
import { axios } from "../config";

import SwalUtility from "../utilities/SwalUtility";

import { GetPosts } from "../hooks";

export interface PostComments {
    id: number;
    postId: number;
    parentId: number | null;
    userId: number;
    role_id: number;
    comment: string;
    likeCount: number;
    replyCount: number; // soon
    full_name: string;
    username: string;
    profileUrl: string;
    verified: boolean;
    liked: boolean;
    createdAt: Date;
    replies: PostComments[];
}

export interface Post {
    postId: number;
    ownerId: number;
    description: string;
    imageUrl: string;
    profileUrl: string;
    full_name: string;
    username: string;
    verified: boolean;
    role_id: number;
    createdAt: Date;
    likeCount: number;
    commentCount: number;
    liked: boolean;
    comments?: PostComments[];
};

interface PostContextType {
    posts: Post[];
    loading: boolean;
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
    AddLike: (id: number) => Promise<void>;
    LikeComment: (postId: number, commentId: number, isReply: boolean) => Promise<void>;
    FetchPost: (search?: string, username?: string) => Promise<void>;
    ReportPost: (postId: number) => Promise<void>;
    DeleteItem: (postId: number, fn?: () => void) => Promise<void>;
};

const PostContext = React.createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = React.useState<Post[]>([]);

    const [loading, setLoading] = React.useState(true);

    const FetchPost = React.useCallback(async (search?: string, username?: string) => {
        setLoading(true);
        try {
            const result = await GetPosts({ search, username });
            setPosts(result);
        } catch (_) {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const ReportPost = async (postId: number) => {
        try {
            const result = await SwalUtility.SendInputDialog("Report Post", "Please input the reason for your report.", "text", "OK");
            const res = await axios.post('/add-report', { postId, reason: result.value });
            if (res.status === 200) 
                SwalUtility.SendMessage("Success", res.data.message, "success");
        } catch (err: any) {
            SwalUtility.SendMessage("Failed", err.message, "error");
        }
    }

    const LikeComment = async (postId: number, commentId: number, isReply: boolean) => {
        setPosts(prev => prev.map(p => p.postId === postId ? {
            ...p,
            comments: p.comments?.map(c => ({
                ...c,
                replies: isReply ?
                    c.replies?.map(r =>
                        r.id === commentId
                            ? { ...r, liked: !r.liked, likeCount: r.liked ? r.likeCount - 1 : r.likeCount + 1 }
                            : r
                    )
                    : c.replies,
                ...(!isReply && c.id === commentId
                    ? { liked: !c.liked, likeCount: c.liked ? c.likeCount - 1 : c.likeCount + 1 }
                    : {}
                )
            }))
        } : p
        ));
        setPosts(prev => prev.map(p => p.postId === postId ? {
            ...p,
            comments: p.comments?.map(c => {
                if (isReply) {
                    return c.id === commentId
                        ? {
                            ...c,
                            replies: c.replies?.map(r =>
                                r.id === commentId ? {
                                    ...r,
                                    liked: !r.liked, // reuse the previous state
                                    likeCount: r.liked ? r.likeCount - 1 : r.likeCount + 1
                                } : r
                            )
                        } : c;
                }
                return c.id === commentId
                    ? {
                        ...c,
                        liked: !c.liked, // reuse the previous state
                        likeCount: c.liked ? c.likeCount - 1 : c.likeCount + 1
                    }
                    : c;
            })
        } : p));

        try {
            const result = await axios.post("add-comment-like", { postId, commentId });
            if (result.status === 200) {
                const cData = result.data.commentData;

                setPosts(prev => prev.map(p => p.postId === postId ? {
                    ...p,
                    comments: p.comments?.map(c => ({
                        ...c,
                        replies: isReply ?
                            c.replies?.map(r =>
                                r.id === commentId
                                    ? { ...r, liked: cData.liked, likeCount: cData.likeCount }
                                    : r
                            )
                            : c.replies,
                        ...(!isReply && c.id === commentId
                            ? { liked: cData.liked, likeCount: cData.likeCount }
                            : {}
                        )
                    }))
                }
                    : p
                ));

                //SwalUtility.SendMessage("Success", result.data.message, "success");
            }
        } catch (error) {
            SwalUtility.SendMessage("Error", "Failed to like comment. Please try again later.", "error");
            setTimeout(() => {
                setPosts(prev => prev.map(p => p.postId === postId ? {
                    ...p,
                    comments: p.comments?.map(c => ({
                        ...c,
                        replies: isReply ?
                            c.replies?.map(r =>
                                r.id === commentId
                                    ? { ...r, liked: !r.liked, likeCount: r.liked ? r.likeCount - 1 : r.likeCount + 1 }
                                    : r
                            )
                            : c.replies,
                        ...(!isReply && c.id === commentId
                            ? { liked: !c.liked, likeCount: c.liked ? c.likeCount - 1 : c.likeCount + 1 }
                            : {}
                        )
                    }))
                } : p
                ));
            }, 200);
        }
    }

    const AddLike = React.useCallback(async (id: number) => {
        // Initial set (For User Experience)
        setPosts(prev => prev.map(p => p.postId === id ? {
            ...p,
            liked: !p.liked,
            likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1
        } : p));

        // API
        try {
            const result = await axios.post(`add-like/${id}`);

            if (result.status === 200) {
                const postData = result.data?.postData;

                setPosts(prev => prev.map(p => p.postId === id ? {
                    ...p,
                    liked: postData?.liked,
                    likeCount: postData?.likeCount
                } : p));
            }
        } catch (_) {
            // Revert the initial set (most commonly found on app like instagram, failed to get API => remove like visual)
            setTimeout(() => {
                setPosts(prev => prev.map(p => p.postId === id ? {
                    ...p,
                    liked: !p.liked,
                    likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1
                } : p));
            }, 200);
        }
    }, []);

    const DeleteItem = async (postId: number, fn?: () => void) => {
        const result = await SwalUtility.SendConfirmationDialog("Delete Post Confirmation", "Are you sure you want to delete this post?", "Delete");
        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`delete-post/${postId}`);
                if (response.status === 200) {
                    await SwalUtility.SendMessage("Success", response.data?.message);
                    FetchPost();

                    if (fn)
                        fn();
                }
            } catch (error: any) {
                await SwalUtility.SendMessage("Failed", error.response?.data?.message || error.message || "Something is wrong when trying to delete post.", "error");
            }
        }
    }

    React.useEffect(() => {
        FetchPost();
    }, []);

    const value: PostContextType = {
        posts, setPosts, AddLike, loading, FetchPost, DeleteItem, LikeComment, ReportPost
    }

    return <PostContext.Provider value={value}>{children}</PostContext.Provider>
}

export const usePosts = () => {
    const context = React.useContext(PostContext);
    if (!context)
        throw new Error("usePosts must be used inside a PostProvider");

    return context;
}