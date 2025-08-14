import React from 'react';
import { axios } from '../../config';

import ViteLogo from '../../assets/vite.svg';

import SwalUtility from '../../utilities/SwalUtility';
import { HandlePreview, HandleUploadFile } from '../../utilities/HandleFile';

import { useUser } from '../../context/UserContext';

import { Posts } from './Helper/Posts';

export default function Home() {
    const { user, RefreshUser } = useUser();

    const [file, setFile] = React.useState<File | null>(null);
    const [description, setDescription] = React.useState<string>('');
    const [previewUrl, setPreviewUrl] = React.useState<string>('');

    const AutoResizeArea = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const textarea: EventTarget & HTMLTextAreaElement = e.currentTarget;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    const HandleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let fileName = '';

        if (description.trim() === '' && !file) {
            SwalUtility.SendMessage("Error", "Please don't post empty thing.", "error");
            return;
        }

        if (file) {
            const uploaded = await HandleUploadFile(file, false);
            if (!uploaded) {
                SwalUtility.SendMessage("Error", "Failed to upload file", "error");
                return;
            }

            fileName = uploaded;
        }

        try {
            const result = await axios.post('add-post', { description, image_url: fileName });
            if (result.status === 200) {
                setDescription('');
                setPreviewUrl('');
                setFile(null);

                //formData = new FormData();

                const res = await SwalUtility.SendSingleConfirmation("Success!", result.data?.message || "You have successfully added a new post.", "OK");
                if (res.isConfirmed)
                    RefreshUser();
            }
            else
                SwalUtility.SendMessage("Error", "Something is wrong when trying to add post.", "error", result.data?.message || "An internal error occured.");
        } catch (_) {
            SwalUtility.SendMessage("Error", "Something is wrong when trying to add post.", "error", "An internal error occured.");
        }
    }

    return (
        <div className="container-fluid home-container h-100 px-0 min-vh-100" style={{ overflowY: 'auto' }}>
            <div className="row home-page d-flex w-100 text-left gx-3">
                <div className="col-9 home-content overflow-y-scroll border-yapper-right">
                    <div>
                        <div className="border-yapper">
                            <div className="home-header position-sticky top-0 bg-white border-yapper p-3" style={{ zIndex: '100' }}>
                                <h3 className="fs-5 fw-bold">Home</h3>
                            </div>
                            <div className="post-yap pb-3 pe-3" style={{ borderBottom: '8px solid var(--yapper-bg)' }}>
                                <form className="d-flex flex-column">
                                    <div className="post-yap-input d-flex p-4">
                                        <img src={ViteLogo} alt="" className="rounded-circle" style={{ height: '40px' }} />
                                        <textarea placeholder="Yap about something here..." onChange={(e) => setDescription(e.target.value)}
                                            id="post-message-content" className="border-0 ms-3 fs-5" style={{ flex: '1' }} onInput={(e) => AutoResizeArea(e)} required />
                                    </div>
                                    {previewUrl !== '' && (
                                        <img src={previewUrl} style={{ marginLeft: '65px', marginRight: '65px', height: '350px', width: '350px', objectFit: 'cover' }} />
                                    )}
                                    <div className="d-flex align-items-center justify-content-end px-4 gap-3 mt-3" style={{ marginLeft: '36px', marginRight: '36px' }}>
                                        <label htmlFor="input-post-img">
                                            <i className="fas fa-image fs-4" role="button"
                                                style={{ WebkitTextStroke: '1px black' }}></i>
                                        </label>
                                        <input type="file" id="input-post-img" className="d-none" accept="image/png, image/jpg, image/jpeg"
                                            onChange={(e) => HandlePreview(e, setFile, setPreviewUrl)} />
                                        <button className="btn btn-yapper round-30 ms-auto px-3" onClick={(e) => HandleSubmit(e)}
                                            style={{ width: '120px', height: '40px' }}>Post Yap!</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <Posts username="" isMain={true} />
                    </div>
                </div>
                <div className="col-3 text-center h-auto m-0" style={{ padding: '6px' }}>
                    <div className="home-header position-sticky top-0 bg-white p-3">
                        <h3 className="fs-5 fw-bold">Recent Posts</h3>
                    </div>
                    <div>
                        <Posts username={user?.username} isMain={false} />
                    </div>
                </div>
            </div>
        </div>
    )
}