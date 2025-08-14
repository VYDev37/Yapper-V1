import Swal from "sweetalert2";

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
}