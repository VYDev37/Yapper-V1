import { useEffect } from "react";

import type { Post } from "../../../../context/PostContext";
import { usePosts } from "../../../../context/PostContext";
import { useUser } from "../../../../context/UserContext";

import Loading from "../../../Fallback/Loading";
import PostCard from "./PostCard";

interface PostArgs {
    search?: string;
    username?: string;
    isMain?: boolean;
    isSelf?: boolean;
}

export default function Posts({ search, username, isMain, isSelf }: PostArgs) {
    const { posts, AddLike, FetchPost, DeleteItem, loading } = usePosts();
    const { user } = useUser();

    useEffect(() => {
        FetchPost(search, username && isMain ? username : '');
    }, [search, FetchPost]);

    const displayedPosts: Post[] = isMain ? posts : username ? 
        posts.filter(post => post.username.toLowerCase() === username).slice(0, 4) :
        posts.filter(post => post.ownerId === user?.id).slice(0, 4);

    if (loading)
        return <Loading />;

    return (
        <div>
            <PostCard displayedPosts={displayedPosts} user={user!}
                actions={{ DeleteItem, AddLike }} isMain={isMain!} isSelf={isSelf!} />
        </div>
    )
}