import Swal from "sweetalert2";
import { axios } from "../config";

export default class SwalUtility {
    static async SendMessage(title: string, text: string, icon: any | string = "success", footer: string = '') {
        if (footer !== '')
            return Swal.fire({ icon, title, text, footer });

        return Swal.fire(title, text, icon);
    }

    static async SendSingleConfirmation(title: string, text: string, confirmButtonText: string, icon: any | string = "success") {
        return Swal.fire({ title, text, icon, confirmButtonColor: "#3085d6", confirmButtonText });
    }

    static async SendConfirmationDialog(title: string, text: string, confirmButtonText: string, icon: any | string = "warning") {
        return Swal.fire({ title, text, icon, showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText });
    }

    static async SendInputDialog(title: string, text: string, inputType: "text" | "email" | "password" | "number" | "textarea" | "url", confirmButtonText: string) {
        return Swal.fire({
            title,
            text,
            input: inputType,
            inputAttributes: { autocapitalize: "off" },
            confirmButtonText: confirmButtonText,
            showLoaderOnConfirm: true,
            preConfirm: async (ret) => ret,
            allowOutsideClick: () => !Swal.isLoading()
        });
    }

    static async SendChangeEmailDialog(isVerified: boolean) {
        return Swal.fire({
            title: "Email Changer Form",
            html: `
            <div class="d-flex flex-column align-items-center text-center mt-3">
                <div class="d-flex align-items-center w-100">
                    <i class="fas fa-envelope p-3 fs-5"></i>
                    <input id="newEmail" class="form-control border-0 border-bottom mx-3" type="email" placeholder="Enter new email address">
                </div>
                ${isVerified ? `
                    <div class="d-flex align-items-center w-100">
                        <i class="fas fa-key p-3 fs-5"></i>
                        <input id="otpCode" type="text" class="form-control border-0 border-bottom mx-3" placeholder="Enter the OTP">
                        <button class="btn btn-yapper" id="get-otp-btn">Get OTP</button>
                    </div>
                ` : ""}
                </div>
    
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Change now!",
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const newEmailInput = document.getElementById("newEmail") as HTMLInputElement;
                const newEmail: string = newEmailInput?.value || "";

                let otpCode = "";
                if (isVerified) {
                    const otpInput = document.getElementById("otpCode") as HTMLInputElement;
                    otpCode = otpInput?.value || "";
                    if (!otpCode) {
                        Swal.showValidationMessage("OTP is required!");
                        return;
                    }
                }

                if (!newEmail) {
                    Swal.showValidationMessage("Email is required!");
                    return;
                }

                return { newEmail, otpCode };
            },
            didOpen: () => {
                if (isVerified) {
                    const otpBtn = document.getElementById("get-otp-btn");
                    otpBtn?.addEventListener("click", async (e) => {
                        e.preventDefault();
                        try {
                            await axios.post("/send-otp-mail/email-changer");
                            Swal.showValidationMessage("OTP sent!");
                        } catch {
                            Swal.showValidationMessage("Message not sent!");
                        }
                        
                    });
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    }

    static async AccountSecurityActivation() {
        return Swal.fire({
            title: "2FA Code",
            html: `
            <div class="d-flex flex-column align-items-center text-center mt-3">
                <div class="d-flex align-items-center w-100">
                    <i class="fas fa-key p-3 fs-5"></i>
                    <input id="newCode" class="form-control border-0 border-bottom mx-3" type="text" placeholder="Enter 2FA Code">
                </div>
                <div class="d-flex align-items-center w-100">
                    <i class="fas fa-key p-3 fs-5"></i>
                    <input id="otpCode" type="text" class="form-control border-0 border-bottom mx-3" placeholder="Enter the OTP">
                    <button class="btn btn-yapper" id="get-otp-btn1">Get OTP</button>
                </div>
            </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Change now!",
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const newCodeInput = document.getElementById("newCode") as HTMLInputElement;
                const newCode: string = newCodeInput?.value || "";

                let otpCode = "";
                const otpInput = document.getElementById("otpCode") as HTMLInputElement;
                otpCode = otpInput?.value || "";
                if (!otpCode) {
                    Swal.showValidationMessage("OTP is required!");
                    return false;
                }

                if (!newCode) {
                    Swal.showValidationMessage("2FA Code is required!");
                    return false;
                }

                return { newCode, otpCode };
            },
            didOpen: () => {
                const otpBtn = document.getElementById("get-otp-btn1");
                otpBtn?.addEventListener("click", async (e) => {
                    e.preventDefault();
                    try {
                        await axios.post("/send-otp-mail/2fa-activation");
                        Swal.showValidationMessage("OTP sent to your email!");
                    } catch {
                        Swal.showValidationMessage("Failed to send OTP.");
                    }
                }, { once: true });
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    }
    static async SendChangePassword(isVerified?: boolean) {
        if (!isVerified)
            return;

        return Swal.fire({
            title: "Password Changer",
            html: `
            <div class="d-flex flex-column align-items-center text-center mt-3">
                <div class="d-flex align-items-center w-100">
                    <i class="fas fa-key p-3 fs-5"></i>
                    <input id="oldPass" class="form-control border-0 border-bottom mx-3" type="text" placeholder="Enter current password">
                </div>
                <div class="d-flex align-items-center w-100">
                    <i class="fas fa-key p-3 fs-5"></i>
                    <input id="newPass" type="text" class="form-control border-0 border-bottom mx-3" placeholder="Enter new password">
                </div>
            </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Change now!",
            showLoaderOnConfirm: true,
            preConfirm: () => {
                if (!isVerified)
                    return false;

                const oldPassInput = document.getElementById("oldPass") as HTMLInputElement;
                const newPassInput = document.getElementById("newPass") as HTMLInputElement;
                const oldPass: string = oldPassInput?.value || "";
                const newPass: string = newPassInput?.value || "";

                return { oldPass, newPass };
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    }
}