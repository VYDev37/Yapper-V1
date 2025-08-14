import { axios } from '../config';

const GetUser = async () => {
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

export default GetUser;