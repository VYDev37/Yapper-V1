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
            showCancelButton: true,
            preConfirm: async (ret) => {
                if (!ret)
                    return;

                return ret;
            },
            allowOutsideClick: false
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

    static async SendBanPanel(role_id?: number) {
        if (role_id! < 2)
            return;

        return Swal.fire({
            title: "Ban Panel",
            html: `
      <div class="d-flex flex-column align-items-center text-center mt-3 w-100">
        <div class="d-flex align-items-center w-100 mb-3">
          <i class="fas fa-envelope p-3 fs-5"></i>
          <input id="ban-reason" class="form-control border-0 border-bottom mx-3" type="text" placeholder="Enter ban reason">
        </div>
        <div class="w-100 text-start">
          <div class="form-check mb-2">
            <input type="radio" id="ban-1h" name="ban_duration" value="1h" class="form-check-input">
            <label class="form-check-label" for="ban-1h">1 hour</label>
          </div>
          <div class="form-check mb-2">
            <input type="radio" id="ban-1d" name="ban_duration" value="1d" class="form-check-input">
            <label class="form-check-label" for="ban-1d">1 day</label>
          </div>
          <div class="form-check mb-2">
            <input type="radio" id="ban-1w" name="ban_duration" value="1w" class="form-check-input">
            <label class="form-check-label" for="ban-1w">7 days</label>
          </div>
          <div class="form-check mb-2">
            <input type="radio" id="ban-1w" name="ban_duration" value="30y" class="form-check-input">
            <label class="form-check-label" for="ban-30y">Max (30 years)</label>
          </div>
          <div class="form-check d-flex align-items-center">
            <input type="radio" id="ban-custom-radio" name="ban_duration" value="custom" class="form-check-input me-2">
            <label class="form-check-label me-2" for="ban-custom-radio">Custom:</label>
            <input type="text" id="ban-custom" class="form-control form-control-sm" placeholder="e.g. 3d or 12h" style="max-width: 120px;">
          </div>
        </div>
      </div>
    `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Ban",
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const reasonInput = document.getElementById("ban-reason") as HTMLInputElement;
                const selected = document.querySelector<HTMLInputElement>('input[name="ban_duration"]:checked');
                const customInput = document.getElementById("ban-custom") as HTMLInputElement;

                const reason = reasonInput?.value.trim();
                let duration = selected?.value;

                if (duration === "custom")
                    duration = customInput?.value.trim();

                if (!reason || reason.length < 3) {
                    Swal.showValidationMessage("Reason must be at least 3 characters");
                    return false;
                }
                if (!duration) {
                    Swal.showValidationMessage("Please select a ban duration");
                    return false;
                }

                return { reason, duration };
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

    }

    static async AskSecurityCode(code?: string) {
        if (!code) {
            await SwalUtility.SendMessage("Warning", "Please activate 2FA to access this feature!", "warning");
            return;
        }

        const res = await SwalUtility.SendInputDialog("Security Code Verification (6 digits)", "Input your security code here", "text", "Confirm");
        if (!res.isConfirmed)
            return;

        const val: string = res.value;
        if (!val || val.trim() === '')
            return;

        if (val !== code) {
            await SwalUtility.SendMessage("Error", "Incorrect Security Code!", "error");
            return;
        }

        return val;
    }
}