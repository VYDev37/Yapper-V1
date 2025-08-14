import React from "react";
import { useParams, NavLink, Outlet } from "react-router-dom";

import type { User } from "../../context/UserContext";
import { useUser } from "../../context/UserContext";
import { GetExtra } from "../../hooks";
import { axios } from "../../config";

import { HandleUploadFile, HandlePreview } from "../../utilities/HandleFile";

import SendProfileChange from "../../utilities/SendProfileChange";
import SwalUtility from "../../utilities/SwalUtility";

import type { ModifiedObj } from "./Helper/Profile";
import { ProfileHeader } from "./Helper/Profile";

// import { ProfileInfo } from "./Helper/Profile/ProfileInfo";

export default function Profile() {
    const { username } = useParams();

    const { user, RefreshUser, UpdateUser } = useUser();

    const [modified, setModified] = React.useState<string[]>([]);
    const [previewUrl, setPreviewUrl] = React.useState<string>('');

    const [other, setOther] = React.useState<User | null>(null);

    const [modifiedObj, setModifiedObj] = React.useState<ModifiedObj>({
        file: null,
        full_name: user?.full_name!,
        username: user?.username!,
        profileUrl: user?.profileUrl!
    });

    const [submitting, setSubmitting] = React.useState<boolean>(false);

    const isAdmin: boolean = user?.role_id! >= 2;
    const isSelf: boolean = !username || user?.username === username;
    const hasAccess: boolean = isSelf || isAdmin;

    const setFile = (file: File | null) => setModifiedObj(prev => ({ ...prev, file }));

    const UpdateProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!hasAccess || submitting)
            return;

        HandlePreview(e, setFile, setPreviewUrl);
        setModified([...modified, 'profile']);
    }

    const GetOthersData = async (self: boolean) => {
        if (self) {
            setModifiedObj({
                file: null,
                full_name: user?.full_name!,
                username: user?.username!,
                profileUrl: user?.profileUrl!
            });
            setOther(null);
            return;
        }

        const otherData = await GetExtra(username);

        setOther(otherData);
        setModifiedObj({ ...modifiedObj, full_name: otherData?.full_name, username: otherData?.username });
    }

    const AddModifiedField = (field: string) => setModified(prev => prev.includes(field) ? prev : [...modified, field]);
    const SetModifiedField = (field: string, value: string) => setModifiedObj(prev => ({ ...prev, [field]: value })); // all editable values are string

    const AddFollower = async (id: number) => {
        if (submitting)
            return;
        // API
        try {
            const result = await axios.post(`add-follower/${id}`);

            if (result.status === 200)
                GetOthersData(false);
        } catch (_) { }
    }

    const HandleSubmit = async (e: React.FormEvent) => {
        let allSuccess = true;
        e.preventDefault();

        if (submitting || !hasAccess)
            return;

        setSubmitting(true);

        try {
            for (const field of modified) {
                if (field === 'profile') {
                    const uploadedFile = await HandleUploadFile(modifiedObj?.file!);
                    const [message, success] = await SendProfileChange(field, { profileUrl: uploadedFile }, profileData?.id!);
                    if (!success) {
                        SwalUtility.SendMessage("Error", message, "error");
                        allSuccess = false;
                        break;
                    }
                } else {
                    const [message, success] = await SendProfileChange(field, { [field]: (modifiedObj as any)[field] }, profileData?.id!);
                    if (!success) {
                        SwalUtility.SendMessage("Error", message, "error");
                        allSuccess = false;
                        break;
                    }
                }
            }

            if (allSuccess)
                SwalUtility.SendMessage("Saved Changes!", "Your changes have been saved!");

            if (modified.includes('username') || modified.includes('full_name')) {
                await UpdateUser();
            } else {
                await RefreshUser();
            }

            // Reset form state
            setFile(null);
            setModified([]);

        } catch (_) {
            //console.error(err);
            SwalUtility.SendMessage("Error", "Failed to save changes.", "error");
        } finally {
            setSubmitting(false);
        }
    }

    React.useEffect(() => {
        GetOthersData(isSelf);
    }, [username, isSelf]);

    const profileData = other ?? user;

    const outletCtx = {
        profile: profileData,
        modifiedObj: modifiedObj,
        actions: { AddModifiedField, SetModifiedField },
        flags: { modified, hasAccess, submitting, username }
    };

    return (
        <div className="container-fluid profile-container h-100" style={{ overflowY: 'auto' }}>
            <div className="row profile-page d-flex w-100 mt-4">
                <div className="card p-0">
                    <ProfileHeader profile={profileData!} modifiedObj={modifiedObj} flags={{ submitting, isSelf, hasAccess, previewUrl }}
                        actions={{ UpdateProfile, AddFollower }} />
                    <div className="card-body">
                        <div className="col-12">
                            <div className="row ms-1">
                                <nav className="navbar navbar-expand-md fs-5 ms-1 pt-0 pb-3">
                                    <ul className="navbar-nav me-auto mb-md-0">
                                        <li className="nav-item">
                                            <NavLink end className={({ isActive }) => "nav-link" + (isActive ? " active2" : "")} to={`/profile/${username || profileData?.username}`}>Basic Info</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active2" : "")} to={`/profile/${username || profileData?.username}/posts`}>Posts</NavLink>
                                        </li>
                                    </ul>
                                </nav>
                                {/* <ProfileInfo profile={profileData!} modifiedObj={modifiedObj} flags={{ modified, hasAccess, submitting, username: username as string }}
                                    actions={{ AddModifiedField, SetModifiedField }} /> */}
                                <Outlet context={outletCtx} />
                            </div>
                        </div>
                    </div>
                    {
                        (modified.length > 0 && hasAccess) && (
                            <div className="card-footer py-2">
                                <button className="btn btn-yapper" style={{ width: '100px' }} disabled={!hasAccess || submitting} onClick={(e) => HandleSubmit(e)}>Update</button>
                            </div>
                        )
                    }
                </div>
            </div>

        </div>
    );
}