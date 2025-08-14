import { axios } from "../config";

// Get uploaded file name
export const HandleUploadFile = async (file: File, isProfile: boolean = true) => {
    let formData: FormData = new FormData();
    formData.append("file_name", "");

    if (file) {
        formData.append('file', file);
        try {
            const uploadResult = await axios.post(`upload-file/${isProfile ? 'profilePic' : 'post'}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return uploadResult.data.fileName || null;
        } catch (err) {
            //console.error(err);
            return null;
        }
    }
}

// C++ Pointer / Copy method
export const HandlePreview = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File) => void,
    setPreviewUrl: (url: string) => void) => {
    const myFile = e.currentTarget.files?.[0];
    if (!myFile) return;

    setFile(myFile);

    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(myFile);
}