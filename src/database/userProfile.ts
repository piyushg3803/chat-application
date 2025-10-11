import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { getAuth } from "@firebase/auth";

const db = getFirestore();
const auth = getAuth();

export const saveUserProfile = async () => {
    try {
        const user = auth.currentUser
        if (!user) return;

        await setDoc(doc(db, "users", user.uid), {
            userId: user.uid,
            email: user.email,
            // username: user.displayName,
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
            online: true
        }, { merge: true });

        console.log("user profile saved successfully");
    }
    catch (error: any) {
        console.error("Error saving user profile", error.message);
        throw error
    }
}