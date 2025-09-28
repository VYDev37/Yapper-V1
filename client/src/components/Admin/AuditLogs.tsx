import React from "react";
import { useNavigate } from "react-router-dom";

import SwalUtility from "../../utilities/SwalUtility";
import { GetTimePast, Truncate, MsToString } from "../../utilities/Format";
import { axios } from "../../config";

interface AuditLogObj {
    id: number;
    reporterId: number;
    postId: number;
    commentId: number;
    postAttachment: number;
    approved: number;
    postOwner: number;
    duration: number;
    reason: string;
    logType: string;
    reporter: string;
    username: string;
    verified: string;
    profileUrl: string;
    postDescription: string;
    createdAt: Date;
}

export default function AuditLogs() {
    const [reports, setReports] = React.useState<AuditLogObj[]>([]);
    const navigate = useNavigate();

    const FetchReports = async () => {
        try {
            const response = await axios.get('/get-reports');
            setReports(response.data.reports);
        } catch (_) {
            //console.log(err);
            setReports([]);
        }
    }

    const HandleNavigation = async (postOwner: number | null, postId: number | null, commentId: number | null) => {
        if (!postId || !postOwner)
            return;

        window.location.replace(`/post/${postOwner}/${postId}${commentId ? `#${commentId}` : ""}`);
    }

    const HandleApproval = async (userId: number) => {
        try {
            const response = await axios.patch(`/approve-verification-request/${userId}`);
            if (response.status === 200) {
                await SwalUtility.SendMessage("Request Approved", response.data.message, "success"); 
                await FetchReports();
            } else {
                await SwalUtility.SendMessage("Error", response.data.message, "error");
            }
        } catch (err: any) {
            console.log(err);
            await SwalUtility.SendMessage("Error", "Something went wrong.", "error", err.message);
        }
    }

    React.useEffect(() => {
        FetchReports();
    }, []);

    return (
        <div className="container-fluid report-container">
            <h3 className="pt-4 fw-bold mb-5">Audit Logs</h3>
            {
                reports.length > 0 ?
                    reports.map(report => (
                        <div className="card my-3 shadow-sm border-0" onClick={() => HandleNavigation(report.postOwner, report.postId, report.commentId)}>
                            <div className="card-body d-flex align-items-start">
                                <div className="me-3 text-danger">
                                    <i className="bi bi-heart-fill fs-4"></i>
                                </div>
                                <img src={`/public/profile-pics/${report.profileUrl}`} onClick={() => navigate(`/profile/${report.username}`)} alt="" className="rounded-circle me-3" style={{ height: '50px', width: '50px', minHeight: '50px', minWidth: '50px', objectFit: 'cover' }} />
                                <div>
                                    <a className="mb-1 text-decoration-none text-black" href={`/profile/${report.username}`}><strong>{report.username}</strong></a><br />
                                    {report.reporter && (
                                        <>
                                            <small className="text-muted">{report.logType} by: <a className="mb-1 text-decoration-none text-black" href={`/profile/${report.reporter}`}><strong>{report.reporter}</strong></a></small><br />
                                        </>
                                    )}
                                    {report.duration > 0 && (
                                        <>
                                            <small className="text-muted">Duration: {MsToString(report.duration, false)}</small><br />
                                        </>
                                    )}
                                    {report.reason && (
                                        <>
                                            <small className="text-muted">Reason: {Truncate(report.reason, 50)}</small><br />
                                        </>
                                    )}
                                    {report.postDescription && (
                                        <>
                                            <small className="text-muted">"{Truncate(report.postDescription, 30)}"</small><br />
                                        </>
                                    )}
                                    {report.createdAt && (
                                        <small className="text-muted">{GetTimePast(report.createdAt)}</small>
                                    )}
                                </div>
                                {report.postAttachment && (
                                    <img src={`/public/${report.postAttachment}`} alt="" className="ms-auto rounded-0 me-3" style={{ height: '80px', width: '80px', minHeight: '80px', minWidth: '80px', objectFit: 'cover' }} />
                                )}
                                {report.approved !== -1 && (
                                    <button className="btn btn-yapper ms-auto" style={{ width: '120px' }} disabled={report.approved === 1} onClick={() => HandleApproval(report.reporterId)}>Approve</button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="d-flex justify-content-center">
                            <h3>You have no any report for now.</h3>
                        </div>
                    )
            }

        </div>
    );
}