import { useEffect, useState } from "react";

import type { Post } from "../../../../context/PostContext";
import type { User } from "../../../../context/UserContext";
import { usePosts } from "../../../../context/PostContext";
import { useUser } from "../../../../context/UserContext";

import Loading from "../../../Fallback/Loading";
import PostCard from "./PostCard";

interface PostArgs {
    search?: string;
    username?: string;
    isMain?: boolean;
    isSelf?: boolean;
    isSearchingUser?: boolean;
}

export default function Posts({ search, username, isMain, isSelf, isSearchingUser }: PostArgs) {
    const { posts, AddLike, FetchPost, DeleteItem, ReportPost, loading } = usePosts();
    const { user, GetUsers } = useUser();

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        FetchPost(search, username && isMain ? username : '');
    }, [search, FetchPost]);

    useEffect(() => {
        const fn = async () => {
            if (!isSearchingUser) 
                return;

            try {
                const result = await GetUsers(search);
                setUsers(result);
            } catch {
                setUsers([]);
            }
        }

        fn();
    }, [search, isSearchingUser]);

    const displayedPosts: Post[] = isMain ? posts : username ?
        posts.filter(post => post.username.toLowerCase() === username).slice(0, 4) :
        posts.filter(post => post.ownerId === user?.id).slice(0, 4);

    if (loading)
        return <Loading />;

    return (
        <div>
            <PostCard displayedPosts={displayedPosts} user={user!}
                actions={{ DeleteItem, AddLike, ReportPost }} isMain={isMain!} isSelf={isSelf!} users={users} isSearchingUser={isSearchingUser!} />
        </div>
    )
}