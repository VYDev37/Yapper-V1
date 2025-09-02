import { useOutletContext } from "react-router-dom";

import type { User } from "../../../../context/UserContext";
import type { ModifiedObj } from "./ProfileHeader";

import { FormatNumber, FormatDate } from "../../../../utilities/Format";

export interface ProfileContext {
    profile: User;
    modifiedObj: ModifiedObj;
    actions: {
        AddModifiedField: (field: string) => void;
        SetModifiedField: (field: string, value: string) => void;

    };
    flags: {
        modified: string[];
        hasAccess: boolean;
        submitting: boolean;
        username: string;
    };
}

export function ProfileInfo() {
    const { profile, modifiedObj, actions, flags } = useOutletContext<ProfileContext>();
    const GetStatusAndRole = (userBase: User | null) => userBase?.role_id! >= 2 ? "Administrator" : userBase?.verified ? "Verified User" : "User";

    return (
        <div className="row">
            <div className="col-6">
                <div className="d-flex flex-column mb-3">
                    <p className="fw-bold fs-5 mb-1">Full Name
                        {flags.hasAccess && (
                            <i className="fas fa-pencil ms-1" style={{ fontSize: '16px' }} role="button" onClick={() => actions.AddModifiedField("full_name")}></i>
                        )}
                    </p>
                    <input value={modifiedObj.full_name} disabled={!flags.modified.includes("full_name") || flags.submitting || !flags.hasAccess} onChange={(e) => actions.SetModifiedField("full_name", e.target.value)} />
                </div>
                {flags.hasAccess && (
                    <div className="d-flex flex-column mb-3">
                        <p className="fw-bold fs-5 mb-1">Status</p>
                        <p className="fs-5">{GetStatusAndRole(profile)}</p>
                    </div>
                )}
                <div className="d-flex flex-column mb-3">
                    <p className="fw-bold fs-5 mb-1">Followers</p>
                    <p className="fs-5">{FormatNumber(profile?.followers!)}</p>
                </div>
                <div className="d-flex flex-column mb-3">
                    <p className="fw-bold fs-5 mb-1">Member since</p>
                    <p className="fs-5">{FormatDate(profile?.createdAt!)}</p>
                </div>
                {flags.hasAccess && (
                    <div className="d-flex flex-column mb-3">
                        <p className="fw-bold fs-5 mb-1">User ID</p>
                        <p className="fs-5">{profile.id}</p>
                    </div>
                )}
            </div>
            <div className="col-6">
                <div className="d-flex flex-column mb-3">
                    <p className="fw-bold fs-5 mb-1">Username
                        {flags.hasAccess && (
                            <i className="fas fa-pencil ms-1" style={{ fontSize: '16px' }} role="button" onClick={() => actions.AddModifiedField("username")}></i>
                        )}
                    </p>
                    <input value={modifiedObj.username} disabled={!flags.modified.includes("username") || flags.submitting || !flags.hasAccess} onChange={(e) => actions.SetModifiedField("username", e.target.value)} />
                </div>
                <div className="d-flex flex-column mb-3">
                    <p className="fw-bold fs-5 mb-1">Following</p>
                    <p className="fs-5">{FormatNumber(profile?.following!)}</p>
                </div>
                {flags.hasAccess && (
                    <>
                        <div className="d-flex flex-column mb-3">
                            <p className="fw-bold fs-5 mb-1">Email</p>
                            <p className="fs-5">{profile?.email}</p>
                        </div>
                        <div className="d-flex flex-column mb-3">
                            <p className="fw-bold fs-5 mb-1">Password</p>
                            <p className="fs-5">{'*'.repeat(profile?.secret!)}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}