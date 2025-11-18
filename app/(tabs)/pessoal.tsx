import { ChecklistCard } from '@/components/admin/ChecklistCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useChecklistStorage } from '@/hooks/useChecklistStorage';
import { useTheme } from '@/hooks/useTheme';
import { VehicleChecklist } from '@/types/checklist';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PessoalScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const { user, logout } = useAuth();
    const router = useRouter();
    const { getAllChecklists } = useChecklistStorage();
    const [checklists, setChecklists] = useState<VehicleChecklist[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadChecklists();
        }, []),
    );

    const loadChecklists = async () => {
        try {
            setLoading(true);
            const data = await getAllChecklists();

            // Se for admin, mostra TODOS os checklists
            // Se for user, mostra apenas os dele
            const filtered =
                user?.role === 'admin'
                    ? data
                    : data.filter((c) => c.userId === user?.id);

            setChecklists(
                filtered.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                ),
            );
        } catch (error) {
            console.error('Erro ao carregar checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        console.log('handleLogout invoked');

        // On web, react-native Alert.alert sometimes behaves differently.
        // Use native confirm dialog as a fallback for clearer UX/debugging.
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const ok = window.confirm('Tem certeza que deseja sair?');
            if (!ok) return;

            (async () => {
                try {
                    console.log('logout starting (web fallback)');
                    const result = await logout();
                    console.log('logout result:', result);
                    if (result && (result as any).success === false) {
                        Alert.alert('Erro', (result as any).error || 'Não foi possível sair');
                        return;
                    }
                    router.replace('/auth');
                } catch (err) {
                    console.error('Erro ao efetuar logout:', err);
                    Alert.alert('Erro', 'Não foi possível sair no momento');
                }
            })();

            return;
        }

        Alert.alert('Logout', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    console.log('logout confirmed (native alert)');
                    try {
                        const result = await logout();
                        console.log('logout result:', result);
                        if (result && (result as any).success === false) {
                            Alert.alert('Erro', (result as any).error || 'Não foi possível sair');
                            return;
                        }

                        // Redireciona para a tela de autenticação após logout
                        router.replace('/auth');
                    } catch (err) {
                        console.error('Erro ao efetuar logout:', err);
                        Alert.alert('Erro', 'Não foi possível sair no momento');
                    }
                },
            },
        ]);
    };

    const pageTitle =
        user?.role === 'admin' ? 'Todos os Checklists' : 'Meus Checklists';

    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
            >
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.surface,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {pageTitle}
                    </Text>
                    <Text
                        style={[
                            styles.headerSubtitle,
                            { color: colors.placeholder },
                        ]}
                    >
                        {user?.name} (
                        {user?.role === 'admin' ? 'Administrador' : 'Usuário'})
                    </Text>
                    <Text
                        style={[
                            styles.headerCount,
                            { color: colors.placeholder },
                        ]}
                    >
                        {checklists.length} checklist
                        {checklists.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <View style={styles.headerButtons}>
                    <ThemeToggle />
                    <TouchableOpacity
                        style={[
                            styles.logoutButton,
                            { backgroundColor: colors.danger || '#dc2626' },
                        ]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {checklists.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: colors.placeholder },
                        ]}
                    >
                        {user?.role === 'admin'
                            ? 'Nenhum checklist encontrado'
                            : 'Você ainda não enviou nenhum checklist'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={checklists}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ChecklistCard checklist={item} />
                    )}
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
        marginBottom: 2,
    },
    headerCount: {
        fontSize: 12,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    logoutButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
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
