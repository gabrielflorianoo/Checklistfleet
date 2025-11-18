import { ChecklistCard } from '@/components/admin/ChecklistCard';
import { useTopBar } from '@/components/TopBarActionsContext';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useChecklistStorage } from '@/hooks/useChecklistStorage';
import { useTheme } from '@/hooks/useTheme';
import { ChecklistStatus, INITIAL_SECTIONS, VehicleChecklist } from '@/types/checklist';
import { confirm, show } from '@/utils/alert';
import { isFirebaseConfigured, uploadChecklists } from '@/utils/firebase';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface ChecklistListProps {
    onSelectChecklist?: (id: string) => void;
    onCreateNew?: () => void;
}

const getThemedColors = (colors: typeof Colors.light) => ({
    editBg: colors.tint || '#bfdbfe',

    editText: colors.text === '#000000' ? '#1e40af' : colors.text,

    deleteBg: colors.danger || '#fecaca',
    deleteText: colors.text === '#FFFFFF' ? '#f9acacff' : '#6a0101ff',

    primaryBg: colors.tint || '#0ea5e9',
    primaryText: colors.background === '#FFFFFF' ? '#fff' : colors.text,
});

const ChecklistListItem = ({
    checklist,
    onPress,
    onEdit,
    onDelete,
    colors,
}: {
    checklist: VehicleChecklist;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
    colors: typeof Colors.light;
}) => {
    const date = new Date(checklist.createdAt).toLocaleDateString('pt-BR');
    const themedColors = getThemedColors(colors);

    return (
        <View
            style={[
                styles.item,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
        >
            <TouchableOpacity style={styles.itemContent} onPress={onPress}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                    {checklist.plate}
                </Text>
                <Text
                    style={[styles.itemSubtitle, { color: colors.placeholder }]}
                >
                    Motorista: {checklist.driver}
                </Text>
                <Text style={[styles.itemDate, { color: colors.placeholder }]}>
                    {date}
                </Text>
            </TouchableOpacity>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[
                        styles.editButton,
                        { backgroundColor: themedColors.editBg },
                    ]}
                    onPress={onEdit}
                >
                    <Text
                        style={[
                            styles.editButtonText,
                            { color: themedColors.editText },
                        ]}
                    >
                        Editar
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.deleteButton,
                        { backgroundColor: themedColors.deleteBg },
                    ]}
                    onPress={onDelete}
                >
                    <Text
                        style={[
                            styles.deleteButtonText,
                            { color: themedColors.deleteText },
                        ]}
                    >
                        Excluir
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const HeaderActions = ({
    user,
    viewMode,
    setViewMode,
    onCreateNew,
    onSync,
    onGenerate,
    uploading,
    generating,
    colors,
    themedColors,
    theme,
    onToggleTheme,
}: {
    user: any;
    viewMode: 'list' | 'cards';
    setViewMode: (v: 'list' | 'cards') => void;
    onCreateNew?: () => void;
    onSync: () => Promise<void>;
    onGenerate: () => Promise<void>;
    uploading: boolean;
    generating: boolean;
    colors: typeof Colors.light;
    themedColors: ReturnType<typeof getThemedColors>;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}) => {
    return (
        <View style={styles.headerRightContainer}>
            <TouchableOpacity
                style={[
                    styles.viewToggle,
                    { borderColor: theme === 'dark' ? colors.tint : colors.border, backgroundColor: 'transparent' },
                ]}
                onPress={onToggleTheme}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Alternar tema"
            >
                <Text style={[styles.viewToggleText, { color: colors.text }]}> 
                    {theme === 'dark' ? '☀️' : '🌙'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.viewToggle,
                    { borderColor: theme === 'dark' ? colors.tint : colors.border, backgroundColor: 'transparent' },
                ]}
                onPress={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Alternar visualização"
            >
                <Text style={[styles.viewToggleText, { color: colors.text }]}> 
                    {viewMode === 'list' ? 'Cartões' : 'Lista'}
                </Text>
            </TouchableOpacity>

            {user?.role === 'admin' && (
                <>
                    <TouchableOpacity
                        style={[styles.uploadButton, { marginRight: 8 }]}
                        onPress={onSync}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel="Sincronizar com Firebase"
                    >
                        <Text style={[styles.generateButtonText]}> 
                            {uploading ? 'Sincronizando...' : 'Sincronizar'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.generateButton]}
                        onPress={onGenerate}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel="Gerar 10 checklists"
                    >
                        <Text style={[styles.generateButtonText]}> 
                            {generating ? 'Gerando...' : 'Gerar 10'}
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            <TouchableOpacity
                style={[
                    styles.createButton,
                    { backgroundColor: themedColors.primaryBg },
                ]}
                onPress={onCreateNew}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Criar novo checklist"
            >
                <Text
                    style={[
                        styles.createButtonText,
                        { color: themedColors.primaryText },
                    ]}
                >
                    + Novo
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export const ChecklistList = ({
    onSelectChecklist,
    onCreateNew,
}: ChecklistListProps) => {
    const { theme, toggleTheme } = useTheme();
    const colors = Colors[theme];
    const themedColors = getThemedColors(colors);
    const { getAllChecklists, deleteChecklist, saveChecklist } = useChecklistStorage();
    const [generating, setGenerating] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();
    const top = useTopBar();
    const [checklists, setChecklists] = useState<VehicleChecklist[]>([]);
    const [loading, setLoading] = useState(true);
    const filteredChecklists =
        user?.role === 'admin'
            ? checklists
            : checklists.filter((c) => c.userId === user?.id);

    useFocusEffect(
        useCallback(() => {
            loadChecklists();
        }, []),
    );

    // register title and header actions in top bar
    React.useEffect(() => {
        const title = user?.role === 'admin' ? 'Todos os Checklists' : 'Meus Checklists';
        const right = () => (
            <HeaderActions
                user={user}
                viewMode={viewMode}
                // pass the setter so HeaderActions can toggle
                setViewMode={setViewMode}
                onCreateNew={onCreateNew}
                onSync={handleSync}
                onGenerate={handleGenerate}
                uploading={uploading}
                generating={generating}
                colors={colors}
                themedColors={themedColors}
                theme={theme}
                onToggleTheme={toggleTheme}
            />
        );

        top.setState({ title, right });
        return () => top.clear();
    }, [user?.role, viewMode, uploading, generating, checklists.length]);

    const loadChecklists = async () => {
        try {
            setLoading(true);
            const data = await getAllChecklists();
            setChecklists(
                data.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                ),
            );
        } catch (error) {
            console.error('Error loading checklists:', error);
            show('Erro', 'Não foi possível carregar os checklists');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, plate: string) => {
        const ok = await confirm(
            'Confirmar exclusão',
            `Tem certeza que deseja excluir o checklist da placa ${plate}?`,
            'Excluir',
        );

        if (!ok) return;

        try {
            await deleteChecklist(id);
            await loadChecklists();
            show('Sucesso', 'Checklist excluído com sucesso');
        } catch (error) {
            console.error('Erro excluindo checklist:', error);
            show('Erro', 'Não foi possível excluir o checklist');
        }
    };

    const handleGenerate = async () => {
        const ok = await confirm('Gerar Checklists', 'Gerar 10 checklists de teste?', 'Gerar');
        if (!ok) return;

        setGenerating(true);
        try {
            for (let i = 1; i <= 10; i++) {
                const now = new Date();
                const checklist: VehicleChecklist = {
                    id: `${Date.now()}-${i}`,
                    plate: `TEST-${String(i).padStart(3, '0')}`,
                    km: `${Math.floor(Math.random() * 100000)}`,
                    driver: `Driver Test ${i}`,
                    date: now.toISOString().split('T')[0],
                    time: now.toTimeString().split(' ')[0],
                    sections: INITIAL_SECTIONS.map((s) => ({
                        ...s,
                        sectionNotes: '',
                        items: s.items.map((it) => {
                            // assign a random status so some show regular/ruim
                            const r = Math.random();
                            const status: ChecklistStatus = r < 0.6 ? 'ok' : r < 0.85 ? 'regular' : 'ruim';
                            return { ...it, status };
                        }),
                    })),
                    generalNotes: 'Auto-generated for testing',
                    driverSignature: '',
                    inspectorSignature: '',
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString(),
                    userId: user?.id,
                };

                // eslint-disable-next-line no-await-in-loop
                await saveChecklist(checklist);
            }

            await loadChecklists();
            show('Sucesso', '10 checklists gerados');
        } catch (err) {
            console.error('Erro gerando checklists:', err);
            show('Erro', 'Não foi possível gerar checklists');
        } finally {
            setGenerating(false);
        }
    };

    const handleSync = async () => {
        if (!isFirebaseConfigured()) {
            show('Firebase não configurado', 'Configure as credenciais do Firebase para usar a sincronização.');
            return;
        }

        const ok = await confirm('Sincronizar Firebase', 'Enviar todos os checklists para o Firestore?', 'Sincronizar');
        if (!ok) return;
        setUploading(true);
        try {
            await uploadChecklists(checklists);
            show('Sucesso', 'Checklists sincronizados com Firebase');
            await loadChecklists();
        } catch (err) {
            console.error('Erro sincronizando Firebase:', err);
            show('Erro', 'Não foi possível sincronizar com Firebase');
        } finally {
            setUploading(false);
        }
    };

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

    const limitedChecklists = filteredChecklists.slice(0, 5);
    const shouldShowLimitMessage = filteredChecklists.length > 5;
    const limitMessage = shouldShowLimitMessage
        ? 'Mostrando os 5 primeiros checklists'
        : `Mostrando todos os ${filteredChecklists.length} checklists`;

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
        >
            {filteredChecklists.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: colors.placeholder },
                        ]}
                    >
                        Nenhum checklist criado ainda
                    </Text>
                    <View style={styles.emptyRow}>
                        <TouchableOpacity
                            style={[
                                styles.emptyButton,
                                { backgroundColor: themedColors.primaryBg },
                            ]}
                            onPress={onCreateNew}
                        >
                            <Text
                                style={[
                                    styles.emptyButtonText,
                                    { color: themedColors.primaryText },
                                ]}
                            >
                                Criar Primeiro Checklist
                            </Text>
                        </TouchableOpacity>
                        {user?.role === 'admin' && (
                            <TouchableOpacity
                                style={[styles.generateButton, { marginLeft: 12 }]}
                                onPress={handleGenerate}
                            >
                                <Text style={[styles.generateButtonText]}>
                                    {generating ? 'Gerando...' : 'Gerar 10'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ) : (
                <>
                    <Text style={styles.limitMessageText}>
                        {limitMessage}
                    </Text>

                    {viewMode === 'list' ? (
                        <FlatList
                            key={'list'}
                            data={limitedChecklists}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ChecklistListItem
                                    checklist={item}
                                    onPress={() => onSelectChecklist?.(item.id)}
                                    onEdit={() => onSelectChecklist?.(item.id)}
                                    colors={colors}
                                    onDelete={() => handleDelete(item.id, item.plate)}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                        />
                    ) : (
                        <FlatList
                            key={`grid-2`}
                            data={limitedChecklists}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.cardWrapper}>
                                    <ChecklistCard checklist={item} />
                                </View>
                            )}
                            numColumns={2}
                            columnWrapperStyle={styles.columnWrapper}
                            contentContainerStyle={styles.gridContent}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    createButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    createButtonText: {
        fontWeight: '600',
        fontSize: 12,
    },
    limitMessageText: {
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 8,
    },
    listContent: {
        padding: 12,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
        marginBottom: 2,
    },
    itemDate: {
        fontSize: 11,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 8,
    },
    editButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
    },
    editButtonText: {
        fontSize: 11,
        fontWeight: '600',
    },
    deleteButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
    },
    deleteButtonText: {
        fontSize: 11,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    emptyButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    emptyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    generateButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#2563eb',
    },
    generateButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    viewToggle: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 6,
        backgroundColor: 'transparent',
    },
    viewToggleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    gridContent: {
        padding: 12,
    },
    cardWrapper: {
        flex: 1,
        padding: 6,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    uploadButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#10b981',
    },
});
