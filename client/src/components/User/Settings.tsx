import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { axios } from "../../config";

import SwalUtility from "../../utilities/SwalUtility";
import SendProfileChange from "../../utilities/SendProfileChange";

interface SettingsOptions {
    name: string;
    description: string;
    infoText?: string;
    icon: string;
    button?: {
        text?: string;
        OnExecute?: () => Promise<void>;
        disabled?: boolean;
    }
}

export default function Settings() {
    const { user, UpdateUser, RefreshUser, Logout } = useUser();
    const [loading, setLoading] = useState<boolean>(false);

    const HandleVerified = async () => {
        try {
            const result = await axios.post('send-verification-request');
            if (result.status === 200)
                await SwalUtility.SendMessage("Success", result.data.message, "success");
        } catch (err: any) {
            await SwalUtility.SendMessage("Failed", err.message, "error");
        }
    }

    const HandleVerification = async () => {
        if (user?.email_verified)
            return;

        try {
            setLoading(true);
            await axios.post("/send-otp-mail/verify");
            const result = await SwalUtility.SendInputDialog("Email Verification (4 digit OTP)", `The verification code has been sent to your email (@${user?.email}). Please check it out.`, "text", "Submit");

            if (!result.isConfirmed)
                return;

            const [message, success] = await SendProfileChange("email", { email_verified: true, otp_code: result.value }, user?.id!);
            if (success) {
                await UpdateUser();
                await RefreshUser();
            }

            await SwalUtility.SendMessage(success ? "Change Success" : "Change Failed", message, success ? "success" : "error");
        } catch (_) {
        } finally {
            setLoading(false);
        }
    }

    const HandleEmailChange = async () => {
        try {
            let security_code: string | undefined;

            if (user?.code) {
                security_code = await SwalUtility.AskSecurityCode(user?.code);
                if (!security_code)
                    return;
            }

            const result = await SwalUtility.SendChangeEmailDialog(user?.email_verified!);
            if (!result.isConfirmed)
                return;

            const { newEmail, otpCode } = result.value;

            if (user?.email_verified && !otpCode) {
                await SwalUtility.SendMessage("Error", "OTP is required!", "error");
                return;
            }

            const [message, success] = await SendProfileChange("email", { email: newEmail, otp_code: otpCode, security_code }, user?.id!);
            if (success) {
                await UpdateUser();
                await RefreshUser();
            }

            await SwalUtility.SendMessage(success ? "Change Success" : "Change Failed", message, success ? "success" : "error");
        } catch (_) {
            //console.error(err);
            await SwalUtility.SendMessage("Error", "Something went wrong.", "error");
        }
    }

    const HandlePasswordChange = async () => {
        try {
            let security_code: string | undefined;

            if (user?.code) {
                security_code = await SwalUtility.AskSecurityCode(user?.code);
                if (!security_code)
                    return;
            }

            const result = await SwalUtility.SendChangePassword(user?.email_verified!);
            if (!result || !result.isConfirmed)
                return;

            const { oldPass, newPass } = result.value;
            const [message, success] = await SendProfileChange("password", { new_password: newPass, old_password: oldPass, security_code }, user?.id!);
            if (success) 
                await RefreshUser();

            await SwalUtility.SendMessage(success ? "Change Success" : "Change Failed", message, success ? "success" : "error");
        } catch (_) {
            await SwalUtility.SendMessage("Error", "Something went wrong.", "error");
        }
    }

    const HandleAccountSecurity = async () => {
        try {
            if (user?.code || !user?.email_verified)
                return;

            const result = await SwalUtility.AccountSecurityActivation();
            if (!result.isConfirmed)
                return;

            const { newCode, otpCode } = result.value;
            if (!otpCode) {
                await SwalUtility.SendMessage("Error", "OTP is required!", "error");
                return;
            }

            const [message, success] = await SendProfileChange("security", { security_code: newCode }, user?.id!);

            if (success)
                await RefreshUser();

            await SwalUtility.SendMessage(success ? "Success" : "Failed", message, success ? "success" : "failed");
        } catch (_) {
            await SwalUtility.SendMessage("Error", "Something went wrong.", "error");
        }
    }

    const HandleLogout = async () => {
        if (loading)
            return;

        try {
            setLoading(true);

            const result = await SwalUtility.SendConfirmationDialog("Are you sure", "You want to log out.", "Log out");

            if (result.isConfirmed)
                Logout();
        } catch (_) {
            //console.log(err);
            SwalUtility.SendMessage("Oops!", "Something is wrong when trying to log out", "error");
        } finally {
            setLoading(false);
        }
    }

    const options: SettingsOptions[] = [
        {
            name: "Sign out",
            description: "Click the button to log out.",
            icon: "fa-sign-out",
            infoText: "Click the button to log out.",
            button: {
                text: "Log out",
                OnExecute: HandleLogout
            }
        },
        {
            name: "Email Status",
            description: `Your email (${user?.email}) is ${user?.email_verified ? "verified." : "not verified."}`,
            icon: "fa-envelope",
            infoText: "Once your email is verified, you can unlock more features, such as message and password changer.",
            button: {
                text: "Verify Email",
                OnExecute: HandleVerification,
                disabled: user?.email_verified
            }
        },
        {
            name: "Email Changer",
            description: "Change email here.",
            icon: "fa-envelope-open",
            infoText: "To prevent the failure of human error during registration, when your email is not verified, we grant you access to change it without verification. However, when your email is already verified, we'll need some verification from your email.",
            button: {
                text: "Change Email",
                OnExecute: HandleEmailChange
            }
        },
        {
            name: "Get Verified Status",
            description: user?.verified ? "You're already a verified user." : "Request your account to be verified user here.",
            icon: "fa-address-card",
            infoText: "Once your account is verified, you will get a blue check icon beside your name. You must have at least 1,000 followers to request.",
            button: {
                text: "Request Verification",
                OnExecute: HandleVerified,
                disabled: user?.verified
            }
        },
        {
            name: "Password Changer",
            description: "Change your password here.",
            icon: "fa-lock",
            infoText: "This process will be done via email. Make sure you've used correct and verified email.",
            button: {
                text: "Change Password",
                OnExecute: HandlePasswordChange,
                disabled: !user?.email_verified
            }
        },
        {
            name: "Two-Factor Authentication",
            description: !user?.code ? "Two-Factor Authentication is off, you can turn it on by clicking the button." : "Two-Factor Authentication is on, you've upgraded your account security with this.",
            icon: "fa-key",
            infoText: "Set your Two-Factor Authentication code for better security. Make sure you've used correct and verified email as this process requires email.",
            button: {
                text: "Activate",
                OnExecute: HandleAccountSecurity,
                disabled: !!user?.code || !user?.email_verified
            }
        }
    ];

    const HandleInfo = (id: number) => SwalUtility.SendMessage("Information", options[id].infoText!, "info");

    return (
        <div className="container-fluid settings-container">
            <div className="col-11">
                <h3 className="pt-4 mt-1 fw-bold">Settings Page</h3>
                <div className="row mx-1 mt-4">
                    {options.map((option, id) => (
                        <div className="card my-3" key={id}>
                            <div className="card-body">
                                <div className="row d-flex justify-content-between align-items-center">
                                    <div className="col-auto text-center">
                                        <i className={`fas ${option.icon} fa-3x text-secondary`}></i>
                                    </div>
                                    <div className="col">
                                        <p className="lead fw-normal mb-2">{option.name}
                                            <i className="fas fa-info-circle ms-2" onClick={() => HandleInfo(id)}></i>
                                        </p>
                                        <p><span className="text-muted">{option.description}</span></p>
                                    </div>
                                    <div className="col-auto text-end">
                                        <button className="btn btn-yapper text-center p-2" disabled={option.button?.disabled || loading}
                                            onClick={option.button?.OnExecute}>{option.button?.disabled ? "" : option.button?.text}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}