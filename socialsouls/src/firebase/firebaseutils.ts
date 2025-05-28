import { db } from './firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  profilePicUrl?: string;
}

export const createUserDocument = async (user: UserData) => {
  if (!user?.uid) return;

  try {
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: user.displayName,
      profilePicUrl: user.profilePicUrl || '',
      createdAt: new Date().toISOString(),
    });
    console.log('User document created!');
  } catch (error) {
    console.error('Error creating user document:', error);
  }
};
