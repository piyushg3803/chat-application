import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebaseAuth";

export const createOrGetChatRoom = async (userId1: string, userId2: string) => {
    try {
        const roomId = [userId1, userId2].sort().join('_');
        const roomRef = doc(db, 'chatRooms', roomId);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
            // Create new chat room with sorted IDs
            await setDoc(roomRef, {
                roomId,
                participants: [userId1, userId2],
                createdAt: serverTimestamp(),
                lastMessage: null
            });
        }
        return { id: roomId };
    }
    catch (error) {
        console.error("Error occured while creating conversation", error);
        throw error;
    }
}

export const sendMessage = async (chatId: string, senderId: string, text: string) => {
    if (!text.trim()) return;

    try {
        const messageData = {
            senderId,
            text,
            createdAt: serverTimestamp()
        };

        const messagesRef = collection(db, "chatRooms", chatId, "messages");
        await addDoc(messagesRef, messageData);
        console.log("Message sent successfully:", { chatId, senderId });
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

export const listenMessages = (chatId: string, callback: Function) => {
    const q = query(
        collection(db, "chatRooms", chatId, "messages"),
        orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(msgs)
    })
}