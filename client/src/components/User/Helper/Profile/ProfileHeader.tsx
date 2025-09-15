import React from "react";
import type { User } from "../../../../context/UserContext";

import VerifiedIcon from "../../../../assets/verified-check.png";

export interface ModifiedObj {
    file: File | null;
    full_name: string;
    username: string;
    profileUrl: string;
}

interface ProfileHeaderProps {
    profile: User;
    modifiedObj: ModifiedObj;
    actions: {
        UpdateProfile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
        AddFollower: (id: number) => Promise<void>;
        ReportUser: (userId: number) => Promise<void>;
        BlockUser: (userId: number) => Promise<void>;
        BanUser: (id: number, isBanned: boolean) => Promise<void>;
    };
    flags: {
        modified: string[];
        submitting: boolean;
        isDev: boolean;
        isSelf: boolean;
        hasAccess: boolean;
        previewUrl: string;
    };
}

export function ProfileHeader({ profile, modifiedObj, actions, flags }: ProfileHeaderProps) {
    return (
        <div className="card-header bg-light" style={{ height: flags.isSelf ? '30vh' : '40vh' }}>
            <div className="mt-5">
                <div className="ms-3">
                    <div>
                        <img src={flags.previewUrl || `/public/profile-pics/${profile?.profileUrl}`} alt="" className="rounded-circle" style={{ height: '100px', width: '100px', objectFit: 'cover' }} />
                        {flags.hasAccess && (
                            <>
                                <label htmlFor="edit-profile"><i className="fas fa-pencil" role="button"></i></label>
                                <input type="file" id="edit-profile" className="d-none" accept="image/png, image/jpg, image/jpeg"
                                    onChange={(e) => actions.UpdateProfile(e)} disabled={flags.submitting} />
                            </>
                        )}
                    </div>
                    <div className="d-flex flex-column">
                        <div className="d-flex align-items-center">
                            <span className="fw-semibold fs-5">{flags.modified.includes("full_name") ? modifiedObj.full_name : profile?.full_name}</span>
                            {(profile?.verified) && (<img src={VerifiedIcon} alt="" className="rounded-circle pt-1" style={{ paddingLeft: '4px', height: '25px' }} />)}
                        </div>
                        <div className="text-muted fs-6">
                            <span style={{ color: profile?.role_id ? 'goldenrod' : 'inherit', fontWeight: '500' }}>(@{flags.modified.includes("username") ? modifiedObj.username : profile?.username})</span>
                        </div>
                        {!flags.isSelf && (
                            <div className="d-flex">
                                <button className={`btn btn-yapper${profile?.followed ? "-danger" : ""} round-30 mt-3`}
                                    onClick={() => actions.AddFollower(profile?.id!)} style={{ height: '45px', width: '100px' }}
                                    disabled={flags.submitting}>{profile?.followed ? "Unfollow" : "Follow"}</button>
                                <button className="btn btn-yapper-danger round-30 mt-3 ms-2"
                                    onClick={() => actions.BlockUser(profile?.id!)} style={{ height: '45px', width: '100px' }}
                                    disabled={flags.submitting}>{profile?.blocked ? "Unblock" : "Block"}</button>
                                <button className="btn btn-yapper-danger round-30 mt-3 ms-2"
                                    onClick={() => actions.ReportUser(profile?.id!)} style={{ height: '45px', width: '100px' }}
                                    disabled={flags.submitting}>Report</button>
                                {(flags.isDev && profile.role_id < 2) && (
                                    <button className="btn btn-yapper-danger round-30 mt-3 ms-2"
                                        onClick={() => actions.BanUser(profile?.id!, !!profile?.banned_until)} style={{ height: '45px', width: '100px' }}
                                        disabled={flags.submitting}>{profile?.banned_until ? "Unban" : "Ban"}</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
