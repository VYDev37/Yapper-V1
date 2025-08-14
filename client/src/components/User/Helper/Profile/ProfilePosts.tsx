import type { ProfileContext } from "./ProfileInfo";
import { useOutletContext } from "react-router-dom";

import { Posts } from "../Posts";

export default function ProfilePosts() {
    const { flags } = useOutletContext<ProfileContext>();

    return (
        <div className="row">
            <Posts search="" username={flags.username} isMain={false} isSelf={true} />
        </div>
    );
}