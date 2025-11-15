import React from "react";

import { IsMobile } from "../../hooks";
import { Posts, RelatedUsers } from "./Helper/Posts";

export default function SearchPage() {
    const [search, setSearch] = React.useState<string>('');
    const [query, setQuery] = React.useState<string>('');

    const isMobile = IsMobile();

    const SearchPost = async (e: React.FormEvent) => {
        e.preventDefault();
        setQuery(search);
    }

    return (
        <div className="container-fluid search-container w-100 h-100">
            <div className="row">
                {/* Main: Found posts page + search */}
                <div className={`col-${isMobile ? "12" : "9"} search-posts border-yapper-right min-vh-100`}>
                    <div className="search-box w-100 position-relative mt-3">
                        <form className="d-flex" onSubmit={(e) => SearchPost(e)}>
                            <i className="fas fa-search position-absolute top-50 translate-middle-y" style={{ left: "8px", color: "#888" }}></i>
                            <input type="search" className="border-yapper w-100 p-2 outline-0 ps-5" placeholder="Find user or post here..."
                                style={{ borderRadius: "8px" }} onChange={(e) => setSearch(e.target.value)} />
                            <button className="btn btn-yapper mx-3" style={{ width: '60px' }}><i className="fas fa-search"></i></button>
                        </form>
                    </div>

                    <Posts search={query} isMain={true} isSearchingUser={true} />
                </div>
                {/* Found users page */}
                {
                    !isMobile && (
                        <div className="col-3 search-users">
                            <div className="home-header position-sticky top-0 bg-white p-3">
                                <h3 className="fs-5 fw-bold">Related Users</h3>
                            </div>
                            <RelatedUsers search={query} />
                        </div>
                    )
                }
            </div>
        </div>
    )
}