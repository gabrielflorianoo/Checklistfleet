import { ChecklistCard } from '@/components/admin/ChecklistCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Colors } from '@/constants/theme';
import { useChecklistStorage } from '@/hooks/useChecklistStorage';
import { useTheme } from '@/hooks/useTheme';
import { VehicleChecklist } from '@/types/checklist';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function AdminScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const { getAllChecklists } = useChecklistStorage();
    const [checklists, setChecklists] = useState<VehicleChecklist[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadChecklists();
        }, [])
    );

    const loadChecklists = async () => {
        try {
            setLoading(true);
            const data = await getAllChecklists();
            setChecklists(
                data.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            );
        } catch (error) {
            console.error('Erro ao carregar checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}
            >
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Admin</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.placeholder }]}>
                        {checklists.length} checklist{checklists.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <ThemeToggle />
            </View>

            {/* Content */}
            {checklists.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.placeholder }]}>
                        Nenhum checklist encontrado
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={checklists}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChecklistCard checklist={item} />}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 12,
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
