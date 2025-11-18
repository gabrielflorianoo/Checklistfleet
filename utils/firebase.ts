import { ENV } from '@/app/config/env';
import { VehicleChecklist } from '@/types/checklist';
import { getApps, initializeApp } from 'firebase/app';
import {
    collection,
    doc,
    getFirestore,
    setDoc,
} from 'firebase/firestore';

// TODO: Replace with your actual Firebase config or load from env
const FIREBASE_CONFIG = {
    apiKey: ENV.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: ENV.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: ENV.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: ENV.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: ENV.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
    measurementId: ENV.FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
};

let dbInitialized = false;

function initFirebase() {
    if (!dbInitialized) {
        if (!getApps().length) {
            initializeApp(FIREBASE_CONFIG);
        }
        dbInitialized = true;
    }
}

export const uploadChecklists = async (checklists: VehicleChecklist[]) => {
    initFirebase();
    const db = getFirestore();

    // Upload each checklist under collection 'checklists' with doc id = checklist.id
    const col = collection(db, 'checklists');

    for (const c of checklists) {
        const ref = doc(col, c.id);
        // Note: setDoc will overwrite existing doc with same id
        await setDoc(ref, c);
    }

    return { uploaded: checklists.length };
};

export default { initFirebase, uploadChecklists };

// -- Firestore CRUD helpers --
export const isFirebaseConfigured = () => {
    // Basic check: ensure projectId and apiKey are present and not placeholder
    return (
        (FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.apiKey) &&
        !String(FIREBASE_CONFIG.projectId).includes('<') &&
        !String(FIREBASE_CONFIG.apiKey).includes('<')
    );
};

const ensureInit = () => {
    if (!isFirebaseConfigured()) return false;
    initFirebase();
    return true;
};

export const fetchAllChecklists = async (): Promise<VehicleChecklist[]> => {
    if (!ensureInit()) {
        throw new Error('Firebase not configured');
    }
    const db = getFirestore();
    const col = collection(db, 'checklists');
    const snapshot = await (await import('firebase/firestore')).getDocs(col);
    const results: VehicleChecklist[] = [];
    snapshot.forEach((d: any) => {
        results.push(d.data() as VehicleChecklist);
    });
    return results;
};

export const saveChecklistFirestore = async (checklist: VehicleChecklist) => {
    if (!ensureInit()) throw new Error('Firebase not configured');
    const db = getFirestore();
    const ref = doc(collection(db, 'checklists'), checklist.id);
    await setDoc(ref, checklist);
};

export const loadChecklistFirestore = async (id: string) => {
    if (!ensureInit()) throw new Error('Firebase not configured');
    const db = getFirestore();
    const d = await (await import('firebase/firestore')).getDoc(doc(db, 'checklists', id));
    return d.exists() ? (d.data() as VehicleChecklist) : null;
};

export const deleteChecklistFirestore = async (id: string) => {
    if (!ensureInit()) throw new Error('Firebase not configured');
    const db = getFirestore();
    await (await import('firebase/firestore')).deleteDoc(doc(db, 'checklists', id));
};
