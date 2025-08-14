import { useEffect } from "react";

import type { Post } from "../../../../context/PostContext";
import { usePosts } from "../../../../context/PostContext";
import { useUser } from "../../../../context/UserContext";

import { axios } from "../../../../config";

import SwalUtility from "../../../../utilities/SwalUtility";
import Loading from "../../../Fallback/Loading";

import PostCard from "./PostCard";

interface PostArgs {
    search?: string;
    username?: string;
    isMain?: boolean;
    isSelf?: boolean;
}

export default function Posts({ search, username, isMain, isSelf }: PostArgs) {
    const { posts, AddLike, FetchPost, loading } = usePosts();
    const { user } = useUser();

    useEffect(() => {
        FetchPost(search, username && isMain ? username : '');
    }, [search, FetchPost]);

    const displayedPosts: Post[] = isMain ? posts : username ? 
        posts.filter(post => post.username.toLowerCase() === username).slice(0, 4) :
        posts.filter(post => post.ownerId === user?.id).slice(0, 4);

    if (loading)
        return <Loading />;

    const DeleteItem = async (postId: number) => {
        const result = await SwalUtility.SendConfirmationDialog("Delete Post Confirmation", "Are you sure you want to delete this post?", "Delete");
        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`delete-post/${postId}`);
                if (response.status === 200) {
                    await SwalUtility.SendMessage("Success", response.data?.message);
                    FetchPost();
                }
            } catch (error: any) {
                await SwalUtility.SendMessage("Failed", error.response?.data?.message || error.message || "Something is wrong when trying to delete post.", "error");
            }
        }
    }

    return (
        <div>
            <PostCard displayedPosts={displayedPosts} user={user!}
                actions={{ DeleteItem, AddLike }} isMain={isMain!} isSelf={isSelf!} />
        </div>
    )
}