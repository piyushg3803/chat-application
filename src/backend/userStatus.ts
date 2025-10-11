import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebaseAuth";

interface UserStatus {
    online: boolean;
    lastSeen: Date;
}

export const useUserStatus = (userId: string) => {
    const [status, setStatus] = useState<UserStatus | null>(null)

    useEffect(() => {

        const userRef = doc(db, "users", userId);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setStatus({
                    online: data.online || false,
                    lastSeen: data.lastSeen?.toDate() || new Date()
                });
            }
        });

        return () => unsubscribe();
    }, [userId]);

    return status;
};