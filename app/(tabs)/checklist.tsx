import { ChecklistForm } from '@/components/checklist/ChecklistForm';
import { ChecklistList } from '@/components/checklist/ChecklistList';
import { useAuth } from '@/hooks/useAuth';
import { useChecklistStorage } from '@/hooks/useChecklistStorage';
import { useTheme } from '@/hooks/useTheme';
import { VehicleChecklist } from '@/types/checklist';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

type ViewMode = 'list' | 'create' | 'edit';

export default function ChecklistScreen() {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { saveChecklist } = useChecklistStorage();
    const { user } = useAuth();
    const { theme } = useTheme();
    const [generating, setGenerating] = useState(false);

    const handleSelectChecklist = (id: string) => {
        setSelectedId(id);
        setViewMode('edit');
    };

    const handleCreateNew = () => {
        setSelectedId(null);
        setViewMode('create');
    };

    const handleSave = (checklist: VehicleChecklist) => {
        setViewMode('list');
        setSelectedId(null);
    };

    const handleGoBack = () => {
        setViewMode('list');
        setSelectedId(null);
    };

    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <View style={styles.container}>
                <ChecklistForm
                    checklistId={selectedId || undefined}
                    onSave={handleSave}
                    onBack={handleGoBack}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ChecklistList
                onSelectChecklist={handleSelectChecklist}
                onCreateNew={handleCreateNew}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    adminRow: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    adminButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    formHeader: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: 'transparent',
    },
    backButton: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        color: '#111827',
        fontWeight: '600',
    },
});