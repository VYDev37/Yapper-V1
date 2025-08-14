import { axios } from '../config';

const GetExtra = async (username?: string) => {
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

export default GetExtra;