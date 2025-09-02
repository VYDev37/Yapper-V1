import { axios } from "../config";

export default class NotificationHandler {
    static async Add() {
        
    }

    static async Get() {
        try {
            const response = await axios.get('/get-notifications');
            return response.data.notifications;
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}