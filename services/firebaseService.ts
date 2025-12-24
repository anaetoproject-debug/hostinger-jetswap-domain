
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  collectionGroup,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  limit,
  enableIndexedDbPersistence,
  updateDoc,
  deleteDoc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { UserProfile } from '../types';
import { EncryptedBundle } from './securityService';

// Your Jet Swap Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEUj7iL4QSWvob9fPSM3yMoVQeXFPxTGA",
  authDomain: "jetswap-eb0fb.firebaseapp.com",
  projectId: "jetswap-eb0fb",
  storageBucket: "jetswap-eb0fb.firebasestorage.app",
  messagingSenderId: "964264902532",
  appId: "1:964264902532:web:6f745c46a9309a4384a7d1",
  measurementId: "G-V997TC18J7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

enableIndexedDbPersistence(db).catch(() => {});

const LOCAL_SWAPS_KEY = 'jetswap_local_history';

const saveSwapLocally = (swap: any) => {
  const existing = JSON.parse(localStorage.getItem(LOCAL_SWAPS_KEY) || '[]');
  const newSwap = {
    ...swap,
    id: swap.id || `local-${Date.now()}`,
    createdAt: swap.createdAt || { toDate: () => new Date() },
    isLocal: true
  };
  localStorage.setItem(LOCAL_SWAPS_KEY, JSON.stringify([newSwap, ...existing].slice(0, 20)));
};

const getSwapsLocally = (userId: string) => {
  const all = JSON.parse(localStorage.getItem(LOCAL_SWAPS_KEY) || '[]');
  return all.filter((s: any) => s.userId === userId);
};

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutUser = () => signOut(auth);
export const loginUserWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);

export const registerUser = async (email: string, pass: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(userCredential.user, {
    displayName: name,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`
  });
  return userCredential.user;
};

export const sendMagicLink = async (email: string) => {
  const actionCodeSettings = { url: window.location.href, handleCodeInApp: true };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
};

export const completeEmailLinkSignIn = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) email = window.prompt('Please provide your email for confirmation');
    if (email) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      return result.user;
    }
  }
  return null;
};

export const listenToAuthChanges = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export async function syncUserProfile(user: UserProfile) {
  try {
    const userRef = doc(db, 'users', user.id);
    const snap = await getDoc(userRef);
    
    // Auto-promote admin for specific identifiers
    let role = user.role || (snap.exists() ? snap.data().role : 'user');
    const adminEmails = ['anaetoproject@gmail.com', 'admin@jetswap.com'];
    
    // Force check
    if (adminEmails.includes(user.identifier.toLowerCase())) {
      role = 'admin';
    }

    await setDoc(userRef, {
      ...user,
      role,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return { ...user, role };
  } catch (error: any) {
    // If we can't write to DB, check role anyway for local session
    const adminEmails = ['anaetoproject@gmail.com', 'admin@jetswap.com'];
    if (adminEmails.includes(user.identifier.toLowerCase())) {
      return { ...user, role: 'admin' };
    }
    return user;
  }
}

export async function recordEncryptedSwap(bundle: EncryptedBundle, metadata: any, userId: string) {
  const swapData = {
    ...bundle,
    ...metadata,
    userId,
    status: 'pending_admin_review',
  };
  saveSwapLocally(swapData);
  try {
    const swapsRef = collection(db, 'users', userId, 'swaps');
    const docRef = await addDoc(swapsRef, {
      ...swapData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    return `local-${Date.now()}`;
  }
}

export async function getUserSwaps(userId: string) {
  try {
    const swapsRef = collection(db, 'users', userId, 'swaps');
    const q = query(swapsRef, orderBy("createdAt", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    return getSwapsLocally(userId);
  }
}

/**
 * ADMINISTRATIVE FUNCTIONS
 */

export async function getAllUsers() {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy("lastSeen", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      throw new Error("PERMISSION_DENIED");
    }
    return [];
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return true;
  } catch (error) {
    return false;
  }
}

export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  try {
    await updateDoc(doc(db, 'users', userId), { role, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getAllSwapsAcrossUsers() {
  try {
    const swapsGroupRef = collectionGroup(db, 'swaps');
    const q = query(swapsGroupRef, orderBy("createdAt", "desc"), limit(200));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      throw new Error("PERMISSION_DENIED");
    }
    return [];
  }
}

export async function updateSwapStatus(swapPath: string, status: string) {
  try {
    const swapRef = doc(db, swapPath);
    await updateDoc(swapRef, { 
      status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    return false;
  }
}
