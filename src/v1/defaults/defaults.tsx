import Handshake from "@/v1/hash/handshake";
// import { session, SessionData } from "@/v1/session/session";

export default class Defaults {

    public static readonly API_BASE_URL = "https://api.rojifi.com/api/v1"; // "http://localhost:9009/api/v1"; // 

    public static readonly HEADERS = {
        "Accept": "*/*",
        "Content-Type": "application/json",
        'x-rojifi-client': 'web.rojifi.com',
        'x-rojifi-version': '0.1.0',
        'x-rojifi-location': 'Unknown',
    };

    public static PARSE_DATA = (data: string, key: string, handshake: string) => {
        const secret: string = Handshake.secret(key, handshake);
        const decryptedData: string = Handshake.decrypt(data, secret);
        const dataObject = JSON.parse(decryptedData);
        return dataObject;
    };

    public static LOGIN_STATUS = () => {
        /**
         * 
         * 
         * 
        const sd: SessionData = session.getUserData();
        if (!sd || !sd.user || !sd.user.loginLastAt) {
            window.location.href = "/login";
            return;
        }

        const loginLastAt: Date = new Date(sd.user.loginLastAt);
        const now: Date = new Date();
        const diffMinutes: number = Math.floor((now.getTime() - loginLastAt.getTime()) / 1000 / 60);
        console.log("diff: ", diffMinutes);

        if (diffMinutes >= 60) {
            session.updateSession({ ...sd, isLoggedIn: false });
            window.location.href = "/login";
            return;
        }

        return true;

        */
    };
}