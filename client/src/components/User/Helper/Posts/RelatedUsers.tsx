import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { usePosts } from "../../../../context/PostContext";

import VerifiedIcon from "../../../../assets/verified-check.png";

interface RelatedUserProps {
    search?: string;
}

export default function RelatedUsers({ search }: RelatedUserProps) {
    const { posts, FetchPost } = usePosts();
    const navigate = useNavigate();

    useEffect(() => {
        FetchPost(search, '');
    }, [search]);

    const uniqueUsers = posts.reduce((acc: any[], post) => {
        if (!acc.find(u => u.ownerId === post.ownerId)) {
            acc.push(post);
        }
        return acc;
    }, []);

    const displayedRelated = search ? uniqueUsers.slice(0, 4) : uniqueUsers;

    return (
        <div>
            {
                displayedRelated.map(users => (
                    <div className="yapper-related-users" key={users.ownerId}>
                        <div className="card shadow-sm my-4 rounded-2 bg-white">
                            {/* User Card header */}
                            <div className="card-header mt-2 border-bottom-0 rounded-4 bg-white">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center text-break text-wrap" onClick={() => navigate(`/profile/${users.username}`)}>
                                        <img src={`/public/profile-pics/${users.profileUrl}`} alt="" className="rounded-circle" style={{ height: '50px', width: '50px', minHeight: '50px', minWidth: '50px', objectFit: 'cover' }} />
                                        <div className="ps-3">
                                            <div className="d-flex align-items-center">
                                                <span className="fw-semibold fs-5">{users.full_name}</span>
                                                {
                                                    users.verified && (<img src={VerifiedIcon} alt="" className="rounded-circle pt-1" style={{ paddingLeft: '4px', height: '25px' }} />)
                                                }
                                            </div>
                                            <div className="text-muted fs-6">
                                                <span style={{ color: users.role_id >= 2 ? 'goldenrod' : 'inherit', fontWeight: '500' }}>(@{users.username})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <a onClick={() => navigate(`/profile/${users.username}`)} className="btn btn-yapper rounded-30" style={{ width: '60px', height: '40px', marginTop: '10px' }}>Visit</a>
                                </div>

                            </div>
                            <div className="card-body">
                                {/* Coming soon */}
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}