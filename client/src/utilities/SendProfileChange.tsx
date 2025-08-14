import { axios } from "../config";

export default async function SendProfileChange(type: string, data: any, userId: number) {
    try {
        const response = await axios.patch(`update-data/${type}/${userId}`, data);
        return [response.data?.message || "Internal server error.", response?.status === 200];
    } catch (error: any) {
        //console.error(error);
        return [error.response?.data?.message || error.message || 'Something went wrong.', false];
    }
}