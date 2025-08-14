import React from "react";
import { axios } from "../config";

import { GetPosts } from "../hooks";

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
    likeCount: number,
    commentCount: number,
    liked: boolean
};

interface PostContextType {
    posts: Post[],
    loading: boolean,
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
    AddLike: (id: number) => Promise<void>;
    FetchPost: (search?: string, username?: string) => Promise<void>;
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

    React.useEffect(() => {
        FetchPost();
    }, []);

    const value: PostContextType = {
        posts, setPosts, AddLike, loading, FetchPost
    }

    return <PostContext.Provider value={value}>{children}</PostContext.Provider>
} 

export const usePosts = () => {
    const context = React.useContext(PostContext);
    if (!context)
        throw new Error("usePosts must be used inside a PostProvider");

    return context;
}