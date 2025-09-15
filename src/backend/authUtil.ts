import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User } from "@firebase/auth";
import { app, db } from './firebaseAuth';
import { saveUserProfile } from "../database/userProfile";
import { doc, setDoc } from "firebase/firestore";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider()

export const signIn = async (email: string, password: string) => {
    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        console.log("user created", userCredentials.user.uid);
        try {
            await setDoc(doc(db, "users", userCredentials.user.uid), {
                email: userCredentials.user.email,
                name: email.split('@')[0],
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            })
            console.log("firestore doc created");
            await saveUserProfile();
            console.log("user profile saved");
            return userCredentials.user
        }
        catch (dbError: any) {
            console.error("Error creating user document:", dbError);
            await auth.currentUser?.delete();
            throw new Error("Failed to create user profile");
        }
    } catch (error: any) {
        console.error("Error in signIn:", error.code, error.message);
        throw error;
    }
};

export const logIn = async (email: string, password: string) => {
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);
    saveUserProfile();
    return userCredentials.user
};

export const googleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider)

        await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        }, { merge: true })

        await saveUserProfile();
        const user = result.user
        return user;
    }
    catch (error: any) {
        console.error("Error In singin", error.code, error.message);
        throw error;
    }
}

export const logOut = async () => {
    await signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
};