import { session, SessionData } from "../session/session";


const loginChecker = (): boolean => {
    const sd: SessionData = session.getUserData();

    if (!sd || !sd.user || !sd.user.loginLastAt) {
        return true;
    }

    const loginLastAt: Date = new Date(sd.user.loginLastAt);
    const now: Date = new Date();
    const diffMinutes: number = Math.floor((now.getTime() - loginLastAt.getTime()) / 1000 / 60);
    console.log("diff: ", diffMinutes);

    if (diffMinutes >= 180) {
        session.updateSession({ ...sd, isLoggedIn: false });
        return false;
    }

    return true;
}

export default loginChecker;