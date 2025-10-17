import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User } from "@firebase/auth";
import { app, db } from './firebaseAuth';
import { saveUserProfile } from "../database/userProfile";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider()

export const signIn = async (email: string, password: string) => {
    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        console.log("user created", userCredentials.user.uid);
        try {
            await setDoc(doc(db, "users", userCredentials.user.uid), {
                email: userCredentials.user.email,
                createdAt: serverTimestamp(),
                lastSeen: serverTimestamp(),
                online: true
            })
            console.log("firestore doc created");
            await saveUserProfile();
            console.log("user profile saved");
            return userCredentials.user
        }
        catch (dbError: unknown) {
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
        const userCredentials = await signInWithPopup(auth, googleProvider)

        await setDoc(doc(db, "users", userCredentials.user.uid), {
            email: userCredentials.user.email,
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
            online: true
        }, { merge: true })

        await saveUserProfile();
        const user = userCredentials.user
        return user;
    }
    catch (error: any) {
        console.error("Error In singin", error.code, error.message);
        throw error;
    }
}

export const uploadProfileImage = async (file: File): Promise<string> => {
    try {
        const storage = getStorage(app)
        if (!auth.currentUser) throw new Error("No authenticated user found");

        const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        console.log("Image uploaded successfully");
        return downloadURL;
    }
    catch (error) {
        console.error("error uploading image:", error);
        throw error;
    }
}

export const CompleteProfile = async (imageBase64: string | null, name: string, bio: string, city: string) => {
    try {
        const user = auth.currentUser
        if (!user) throw new Error("No authenticated user found");

        console.log("problem is something here");

        type FirebaseUpdatedData = { [key: string]: any };

        const updatedData: FirebaseUpdatedData = {
            displayName: name,
            about: bio,
            location: city
        }

        if (imageBase64) {
            updatedData.profileImg = imageBase64;
        }

        await updateDoc(doc(db, "users", user.uid), updatedData);
        console.log("Profile updated successfully");
    }
    catch (error) {
        console.log("Error occured while completing profile", error);   
        throw error
    }
}

export const updateUserStatus = async (userId: string, isOnline: boolean) => {
    try {
        await updateDoc(doc(db, "users", userId), {
            online: isOnline,
            lastSeen: serverTimestamp()
        })
    }
    catch (err) {
        console.log("Error updating user status", err);
    }
}

export const logOut = async () => {
    try {
        const userId = auth.currentUser?.uid;
        if (userId) {
            await updateDoc(doc(db, "users", userId), {
                online: false,
                lastSeen: serverTimestamp()
            });
        }
        await signOut(auth);
    }
    catch (err) {
        console.error("error occurred during logout", err);
        throw err;
    }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (user) => {
        try {
            if (user) {
                await updateUserStatus(user.uid, true);
                console.log("yes, user is here", user);


                const handleUnload = async () => {
                    await updateUserStatus(user.uid, false)
                };
                window.addEventListener('beforeunload', handleUnload)

                callback(user)
            }
            else {
                console.log("user is not here");
                callback(null)
            }
        }
        catch (error) {
            console.error("Error in auth state change", error);
            callback(null)

        }
    })
};