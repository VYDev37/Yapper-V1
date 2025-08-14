import { axios } from "../config";

interface GetPostsParam {
    search?: string,
    username?: string
}

export default async function GetPosts({ search, username }: GetPostsParam) {
    try {
        const result = await axios.get(`/get-posts`, { params: { search, username } });
        if (result.status === 200)
            return result.data?.posts;

        return [];
    } catch (_) {
        return [];
    }
}