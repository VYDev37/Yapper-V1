import { axios } from '../config';

export default async function GetUser() {
    try {
        const response = await axios.get('user-data');
        if (response.status === 200) {
            return response.data.user || null;
        } else {
            return null;
        }
    } catch (_) {
        return null;
    }
}