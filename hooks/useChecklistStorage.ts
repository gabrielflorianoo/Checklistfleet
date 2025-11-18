import { VehicleChecklist } from '@/types/checklist';
import {
    deleteChecklistFirestore,
    fetchAllChecklists,
    isFirebaseConfigured,
    loadChecklistFirestore,
    saveChecklistFirestore,
} from '@/utils/firebase';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// dynamic import for file system on native
const readFileAsBase64Native = async (uri: string): Promise<string | null> => {
    try {
        const FileSystem = await import('expo-file-system');
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
        // default to jpeg mime
        return `data:image/jpeg;base64,${base64}`;
    } catch (err) {
        console.error('Erro lendo arquivo como base64 (native):', err);
        return null;
    }
};

const readUrlAsBase64Web = async (url: string): Promise<string | null> => {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise<string | null>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(null);
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        console.error('Erro lendo URL como base64 (web):', err);
        return null;
    }
};

const ensureImagesAreDataUrls = async (images?: string[]) : Promise<string[]> => {
    if (!images || images.length === 0) return [];
    const out: string[] = [];
    for (const img of images.slice(0, 2)) {
        if (!img) continue;
        if (img.startsWith('data:')) {
            out.push(img);
            continue;
        }

        let converted: string | null = null;
        if (Platform.OS === 'web') {
            converted = await readUrlAsBase64Web(img);
        } else {
            converted = await readFileAsBase64Native(img);
        }

        if (converted) out.push(converted);
        else out.push(img); // fallback to original uri
    }
    return out;
};

const STORAGE_KEY = '@checklistfleet:checklists';

export const useChecklistStorage = () => {
    const { getItem, setItem, removeItem } = useAsyncStorage(STORAGE_KEY);

    const getAllChecklists = async (): Promise<VehicleChecklist[]> => {
        try {
            if (isFirebaseConfigured()) {
                // fetch from Firestore
                const remote = await fetchAllChecklists();
                return remote || [];
            }

            const data = await getItem();
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading checklists:', error);
            return [];
        }
    };

    const saveChecklist = async (
        checklist: VehicleChecklist,
    ): Promise<void> => {
        try {
            // Ensure images are stored as base64 data URLs for cross-platform compatibility
            const prepared: VehicleChecklist = {
                ...checklist,
                images: await ensureImagesAreDataUrls(checklist.images),
            } as VehicleChecklist;

            if (isFirebaseConfigured()) {
                await saveChecklistFirestore(prepared);
                return;
            }

            const checklists = await getAllChecklists();
            const index = checklists.findIndex((c) => c.id === prepared.id);

            if (index >= 0) {
                checklists[index] = prepared;
            } else {
                checklists.push(checklist);
            }

            await setItem(JSON.stringify(checklists));
        } catch (error) {
            console.error('Error saving checklist:', error);
            throw error;
        }
    };

    const loadChecklist = async (
        id: string,
    ): Promise<VehicleChecklist | null> => {
        try {
            if (isFirebaseConfigured()) {
                return await loadChecklistFirestore(id);
            }

            const checklists = await getAllChecklists();
            return checklists.find((c) => c.id === id) || null;
        } catch (error) {
            console.error('Error loading checklist:', error);
            return null;
        }
    };

    const deleteChecklist = async (id: string): Promise<void> => {
        try {
            if (isFirebaseConfigured()) {
                await deleteChecklistFirestore(id);
                return;
            }

            const checklists = await getAllChecklists();
            const filtered = checklists.filter((c) => c.id !== id);
            await setItem(JSON.stringify(filtered));
        } catch (error) {
            console.error('Error deleting checklist:', error);
            throw error;
        }
    };

    return {
        getAllChecklists,
        saveChecklist,
        loadChecklist,
        deleteChecklist,
    };
};
