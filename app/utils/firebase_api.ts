import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { Adventure } from "../components/types";
import { db } from "@/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const saveAdventure = async (
  adventureId: string,
  userId: string,
  adventure: Adventure
): Promise<void> => {
  try {
    const adventureRef = doc(db, "users", userId, "adventures", adventureId); // Use existing document ID
    await setDoc(
      adventureRef,
      {
        title: adventure.title,
        aiInstructions: adventure.aiInstructions,
        plotEssentials: adventure.plotEssentials,
        summary: adventure.summary,
        messages: adventure.messages, // Update only the fields you want
        characters: adventure.characters,
      },
      { merge: true }
    ); // Merge updates with existing fields
  } catch (error) {
    console.error("Error saving conversation:", error);
    console.log(adventure);
  }
};

export const createAdventure = async (
  userId: string,
  adventure: Adventure
): Promise<string> => {
  try {
    const adventureRef = doc(
      collection(doc(db, "users", userId), "adventures")
    ); // Generate a new ID
    await setDoc(adventureRef, {
      title: adventure.title,
      aiInstructions: adventure.aiInstructions,
      plotEssentials: adventure.plotEssentials,
      summary: adventure.summary,
      messages: adventure.messages, // Include messages in the same call
      characters: adventure.characters,
    });

    return adventureRef.id;
  } catch (error) {
    console.error("Error saving conversation:", error);
    console.log(adventure);
    throw Error("Failed to save adventure");
  }
};

export const getAdventures = async (userId: string) => {
  const adventuresRef = collection(db, "users", userId, "adventures");
  const querySnapshot = await getDocs(adventuresRef);
  const adventures: Adventure[] = [];

  querySnapshot.forEach((doc) => {
    const adventure: Adventure = doc.data() as Adventure;
    adventures.push({ id: doc.id, ...adventure });
  });

  return adventures;
};

const base64ToBlob = (base64String: string, contentType: string): Blob => {
  const byteCharacters = atob(base64String);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset++) {
    byteArrays.push(byteCharacters.charCodeAt(offset));
  }

  return new Blob([new Uint8Array(byteArrays)], { type: contentType });
};

export const uploadBase64Image = async (
  base64String: string,
  contentType: string,
  location: "messages" | "characters",
  id: string,
  adventureId: string
) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const storagePath = `images/${
    user!.uid
  }/${adventureId}/${location}/${id}.png`;

  const storage = getStorage();
  const storageRef = ref(storage, storagePath); // Specify the path in Firebase Storage (e.g., 'images/user-image.png')

  // Convert base64 string to Blob
  const imageBlob = base64ToBlob(base64String, contentType);

  // Upload the Blob to Firebase Storage
  await uploadBytes(storageRef, imageBlob);

  // Get the download URL after uploading
  const imageUrl = await getDownloadURL(storageRef);

  return imageUrl; // Return the URL to be stored in Firestore or elsewhere
};
