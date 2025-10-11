import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseAuth";
import { getAuth } from "@firebase/auth";

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
            text: text.trim(),
            createdAt: serverTimestamp(),
            seenBy: [senderId]
        };

        const messagesRef = collection(db, "chatRooms", chatId, "messages");
        const messageDoc = await addDoc(messagesRef, messageData);

        await updateDoc(doc(db, "chatRooms", chatId), {
            lastMessage: {
                text: text.trim(),
                senderId,
                timestamp: serverTimestamp()
            }
        });

        return messageDoc.id;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

export const listenMessages = (chatId: string, callback: Function) => {
    const auth = getAuth()
    const currentUser = auth.currentUser?.uid

    if (!currentUser || !chatId) {
        console.error("Missing user ID or Chat ID");
        return () => { };
    }

    const q = query(
        collection(db, "chatRooms", chatId, "messages"),
        orderBy("createdAt", "asc"),
    );

    const roomRef = doc(db, "chatRooms", chatId);
    getDoc(roomRef).then(roomDoc => {
        if (!roomDoc.exists() || !roomDoc.data()?.participants.includes(currentUser)) {
            console.error("user is not a participant in this chat");
            return;
        }

        return onSnapshot(q, async (snapshot) => {
            try {
                const msgs = snapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        ...data,
                        isCurrentUser: data.senderId === currentUser
                    }
                });

                snapshot.docs.forEach(async (doc) => {
                    const data = doc.data();
                    if (!data.seenBy?.includes(currentUser) && data.senderId !== currentUser) {
                        try {
                            await updateDoc(doc.ref, {
                                seenBy: arrayUnion(currentUser)
                            });
                        } catch (error) {
                            console.error(`Error updating seen status for message ${doc.id}:`, error);
                        }
                    }
                });
                callback(msgs)
            }
            catch (error) {
                console.error("Error while listening the message", error);
            }
        })
    }).catch(error => {
        console.error("Error checking chat room:", error)
    })
}

export const deleteConversation = async (chatRoomId: string) => {
    try {
        const chatMessages = collection(db, "chatRooms", chatRoomId, "messages")
        const mesgSnap = await getDocs(chatMessages)

        const deletePromises = mesgSnap.docs.map((msgDoc) => deleteDoc(msgDoc.ref))
        await Promise.all(deletePromises)

        await deleteDoc(doc(db, "chatRooms", chatRoomId))

        console.log("Chat Room was deleted");
    }
    catch(error){
        console.error("Error Deleting the Chat Room.", error);    
    }
}