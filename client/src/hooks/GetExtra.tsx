import { axios } from '../config';

export default async function GetExtra(username?: string) {
    try {
        const response = await axios.get(`user-info/${username}`);
        if (response.status === 200) {
            return response.data.info || null;
        } else {
            return null;
        }
    } catch (_) {
        return null;
    }
}