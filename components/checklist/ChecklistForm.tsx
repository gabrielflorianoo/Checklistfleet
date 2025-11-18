import { useTopBar } from '@/components/TopBarActionsContext';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useChecklistStorage } from '@/hooks/useChecklistStorage';
import { useTheme } from '@/hooks/useTheme';
import {
    ChecklistStatus,
    INITIAL_SECTIONS,
    VehicleChecklist,
} from '@/types/checklist';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { validateDateString, validateKm, validatePlate, validateText, validateTimeString } from '@/utils/validateData';
import { AutoFillButton } from './AutoFillButton';
import { ChecklistSection } from './ChecklistSection';
import { TextInputField } from './TextInputField';

export interface ChecklistFormProps {
    checklistId?: string;
    onSave?: (checklist: VehicleChecklist) => void;
    onBack?: () => void;
}

const generateRandomData = () => {
    const randomPlate = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const l1 = letters[Math.floor(Math.random() * 26)];
        const l2 = letters[Math.floor(Math.random() * 26)];
        const l3 = letters[Math.floor(Math.random() * 26)];
        const n1 = Math.floor(Math.random() * 10);
        const n2 = Math.floor(Math.random() * 10);
        const n3 = Math.floor(Math.random() * 10);
        const n4 = Math.floor(Math.random() * 10);
        return `${l1}${l2}${l3}-${n1}${n2}${n3}${n4}`;
    };

    const statuses: ChecklistStatus[] = ['ok', 'regular', 'ruim'];
    const getRandomStatus = () =>
        statuses[Math.floor(Math.random() * statuses.length)];

    return {
        plate: randomPlate(),
        km: String(Math.floor(Math.random() * 100000) + 10000),
        driver: 'Motorista Teste ' + Math.floor(Math.random() * 100),
        generalNotes:
            'Checklist preenchido automaticamente para fins de teste.',
        driverSignature: 'M. Teste',
        inspectorSignature: 'I. Resp.',

        sections: INITIAL_SECTIONS.map((section) => ({
            ...section,
            sectionNotes:
                Math.random() > 0.7
                    ? `Nota aleatória para a seção ${section.title}.`
                    : '',
            items: section.items.map((item) => ({
                ...item,
                status: getRandomStatus(),
                notes:
                    Math.random() > 0.8 ? `Observação para ${item.notes}.` : '',
            })),
        })),
    };
};

export const ChecklistForm = ({ checklistId, onSave, onBack }: ChecklistFormProps) => {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const { user } = useAuth();
    const { loadChecklist, saveChecklist } = useChecklistStorage();
    const [checklist, setChecklist] = useState<VehicleChecklist>(() => ({
        id: checklistId || Date.now().toString(),
        userId: user?.id || '',
        plate: '',
        km: '',
        driver: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        sections: INITIAL_SECTIONS.map((section) => ({
            ...section,
            sectionNotes: '',
        })),
        images: [],
        generalNotes: '',
        driverSignature: '',
        inspectorSignature: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));
    const thresholdScrollY = 400;

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                if (checklistId) {
                    const loaded = await loadChecklist(checklistId);
                    if (loaded) {
                        setChecklist(loaded);
                    }
                }
            };
            loadData();
        }, [checklistId]),
    );

    const handleSave = async () => {
        // Validate plate
        if (!checklist.plate || !validatePlate(checklist.plate)) {
            Alert.alert('Erro', 'Placa inválida. Use formato válido (ex: ABC-1234 ou padrão Mercosul).');
            return;
        }

        // Validate driver name (no empty, no digits)
        if (!checklist.driver || !validateText(checklist.driver)) {
            Alert.alert('Erro', 'Nome do motorista inválido. Evite números e deixe o campo preenchido.');
            return;
        }

        // Validate KM (accepts numeric strings)
        if (!validateKm(checklist.km)) {
            Alert.alert('Erro', 'KM inválido. Insira um número maior que zero.');
            return;
        }

        // Validate date string
        if (!validateDateString(checklist.date)) {
            Alert.alert('Erro', 'Data inválida. Use o formato YYYY-MM-DD.');
            return;
        }

        // Validate time string
        if (!validateTimeString(checklist.time)) {
            Alert.alert('Erro', 'Horário inválido. Use o formato HH:MM (24h).');
            return;
        }

        const updatedChecklist = {
            ...checklist,
            userId: checklist.userId || user?.id || '',
            updatedAt: new Date().toISOString(),
        } as VehicleChecklist;

        try {
            await saveChecklist(updatedChecklist);
            Alert.alert('Sucesso', 'Checklist salvo com sucesso!');
            onSave?.(updatedChecklist);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o checklist');
        }
    };

    const handleAutoFill = () => {
        const randomData = generateRandomData();

        setChecklist((prev) => ({
            ...prev,
            ...randomData,
            sections: randomData.sections,
            updatedAt: new Date().toISOString(),
        }));
        Alert.alert(
            'Preenchimento Automático',
            'Formulário preenchido com dados aleatórios para teste.',
        );
    };

    const handlePickImage = async () => {
        // enforce max 2 images (front + rear)
        if ((checklist.images || []).length >= 2) {
            Alert.alert('Limite atingido', 'Máximo de 2 imagens (frente e traseira).');
            return;
        }

        if (Platform.OS === 'web') {
            // Allow desktop file selection only for admin users (testing only)
            if (user?.role !== 'admin') {
                Alert.alert('Indisponível', 'Adicionar imagens não está disponível no navegador');
                return;
            }

            try {
                if (typeof document === 'undefined') {
                    Alert.alert('Indisponível', 'Seleção de arquivos não suportada neste ambiente');
                    return;
                }

                const input: HTMLInputElement = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = false;

                input.onchange = () => {
                    const file = input.files && input.files[0];
                    if (file) {
                        try {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const result = reader.result as string | null;
                                if (result) {
                                    // result is a data URL like 'data:image/png;base64,...'
                                    setChecklist((prev) => ({
                                        ...prev,
                                        images: [...(prev.images || []), result].slice(0, 2),
                                    }));
                                }
                            };
                            reader.onerror = (e) => {
                                console.error('FileReader error', e);
                                Alert.alert('Erro', 'Não foi possível processar a imagem selecionada');
                            };
                            reader.readAsDataURL(file);
                        } catch (err) {
                            console.error('Erro ao criar URL da imagem selecionada:', err);
                            Alert.alert('Erro', 'Não foi possível processar a imagem selecionada');
                        }
                    }
                };

                input.click();
            } catch (err) {
                console.error('File input error (web):', err);
                Alert.alert('Erro', 'Não foi possível abrir o seletor de arquivos');
            }

            return;
        }

        try {
            const ImagePicker = await import('expo-image-picker');
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Permissão para acessar a galeria é necessária');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                base64: true,
            });

            if (!result.cancelled) {
                // result.base64 is available because we requested it
                const base64 = (result as any).base64 as string | undefined;
                if (base64) {
                    // attempt to detect mime type from uri extension
                    const mime = result.uri?.match(/\.([0-9a-zA-Z]+)(?:\?|$)/)?.[1] || 'jpg';
                    const dataUrl = `data:image/${mime === 'jpg' ? 'jpeg' : mime};base64,${base64}`;
                    setChecklist((prev) => ({
                        ...prev,
                        images: [...(prev.images || []), dataUrl].slice(0, 2),
                    }));
                } else {
                    // fallback: store uri directly
                    const uri = result.uri;
                    setChecklist((prev) => ({
                        ...prev,
                        images: [...(prev.images || []), uri].slice(0, 2),
                    }));
                }
            }
        } catch (err) {
            console.error('Image picker error:', err);
            Alert.alert('Erro', 'Não foi possível selecionar imagem');
        }
    };

    const handleRemoveImage = (index: number) => {
        setChecklist((prev) => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index),
        }));
    };

    const updateSection = (sectionId: string, updates: any) => {
        setChecklist((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId ? { ...section, ...updates } : section,
            ),
        }));
    };

    const updateItem = (sectionId: string, itemId: string, updates: any) => {
        setChecklist((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        items: section.items.map((item) =>
                            item.id === itemId
                                ? { ...item, ...updates }
                                : item,
                        ),
                    }
                    : section,
            ),
        }));
    };

    const scrollRef = useRef<ScrollView | null>(null);
    const [scrollY, setScrollY] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [scrollViewHeight, setScrollViewHeight] = useState(0);

    const canScroll = contentHeight > scrollViewHeight;

    const handleScrollToTop = () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const handleScrollToEnd = () => {
        scrollRef.current?.scrollToEnd({ animated: true });
    };

    const top = useTopBar();

    React.useEffect(() => {
        try {
            top.setState({
                title: '🚗 Checklist de Veículo',
                left: (
                    <TouchableOpacity onPress={() => onBack?.()} style={styles.headerBack}>
                        <Text style={[styles.backText, { color: colors.text }]}>‹ Voltar</Text>
                    </TouchableOpacity>
                ),
            });
            return () => top.clear();
        } catch (err) {
            // ignore when provider not present
        }
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <ScrollView
                ref={(r) => (scrollRef.current = r)}
                showsVerticalScrollIndicator={false}
                onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
                scrollEventThrottle={16}
                onContentSizeChange={(_, h) => setContentHeight(h)}
                onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
            >
                {/* Header moved to TopBar */}

                <AutoFillButton onAutoFill={handleAutoFill} colors={colors} />

                <View style={{ marginHorizontal: 12 }}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Fotos</Text>
                    {/* Thumbnails row (always horizontal) */}
                    <View style={styles.thumbsRow}>
                        {(checklist.images || []).map((uri, idx) => (
                            <View key={uri + idx} style={styles.thumbContainer}>
                                <Image source={{ uri }} style={styles.thumb} />
                                <TouchableOpacity
                                    style={styles.removeThumb}
                                    onPress={() => handleRemoveImage(idx)}
                                    accessibilityLabel={`Remover imagem ${idx + 1}`}
                                >
                                    <Text style={styles.removeThumbText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* Add button below thumbnails */}
                    <View style={[styles.addButtonWrapper, Platform.OS === 'web' ? styles.addButtonWrapperWeb : null]}>
                        <TouchableOpacity
                            style={[
                                styles.addImageButton,
                                { backgroundColor: colors.tint },
                            ]}
                            onPress={handlePickImage}
                            disabled={((checklist.images || []).length >= 2) || (Platform.OS === 'web' && user?.role !== 'admin')}
                        >
                            <Text style={styles.addImagePlus}>+</Text>
                            <Text style={styles.addImageText}>
                                {Platform.OS === 'web'
                                    ? user?.role === 'admin'
                                        ? ((checklist.images || []).length >= 2 ? 'Limite atingido' : 'Adicionar Foto (Admin)')
                                        : 'Não disponível'
                                    : ((checklist.images || []).length >= 2 ? 'Limite atingido' : 'Adicionar Foto')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Preview area: larger horizontal scroll of selected images */}
                    {(checklist.images || []).length > 0 && (
                        <View style={[styles.previewContainer, { alignItems: 'center' }]}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8 }}>
                                {(checklist.images || []).map((uri, idx) => (
                                    <View key={`preview-${uri}-${idx}`} style={[styles.previewCard, { borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' }]}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        <View style={styles.previewFooter}>
                                            <Text style={[styles.previewLabel, { color: colors.text }]}>{idx === 0 ? 'Frente' : idx === 1 ? 'Trás' : `Imagem ${idx + 1}`}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveImage(idx)} style={styles.previewRemove}>
                                                <Text style={styles.previewRemoveText}>Remover</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                <View
                    style={[
                        styles.formSection,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>
                        Informações Gerais
                    </Text>
                    <TextInputField
                        label="Placa do Veículo"
                        value={checklist.plate}
                        onChangeText={(plate) =>
                            setChecklist((prev) => ({ ...prev, plate }))
                        }
                        placeholder="Ex: ABC-1234"
                    />
                    <TextInputField
                        label="KM Atual"
                        value={checklist.km}
                        onChangeText={(km) =>
                            setChecklist((prev) => ({ ...prev, km }))
                        }
                        placeholder="Ex: 50000"
                        keyboardType="numeric"
                    />
                    <TextInputField
                        label="Motorista"
                        value={checklist.driver}
                        onChangeText={(driver) =>
                            setChecklist((prev) => ({ ...prev, driver }))
                        }
                        placeholder="Nome do motorista"
                    />
                    <TextInputField
                        label="Data"
                        value={checklist.date}
                        onChangeText={(date) =>
                            setChecklist((prev) => ({ ...prev, date }))
                        }
                        placeholder="YYYY-MM-DD"
                    />
                    <TextInputField
                        label="Horário"
                        value={checklist.time}
                        onChangeText={(time) =>
                            setChecklist((prev) => ({ ...prev, time }))
                        }
                        placeholder="HH:MM"
                    />
                </View>

                {checklist.sections.map((section) => (
                    <ChecklistSection
                        key={section.id}
                        section={section}
                        onItemStatusChange={(itemId, status) =>
                            updateItem(section.id, itemId, {
                                status: status as ChecklistStatus,
                            })
                        }
                        onItemNotesChange={(itemId, notes) =>
                            updateItem(section.id, itemId, { notes })
                        }
                        onSectionNotesChange={(notes) =>
                            updateSection(section.id, { sectionNotes: notes })
                        }
                    />
                ))}

                <View
                    style={[
                        styles.formSection,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>
                        Observações Gerais
                    </Text>
                    <TextInputField
                        label="Observações"
                        value={checklist.generalNotes}
                        onChangeText={(generalNotes) =>
                            setChecklist((prev) => ({ ...prev, generalNotes }))
                        }
                        placeholder="Adicione observações gerais do checklist..."
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View
                    style={[
                        styles.formSection,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>
                        Assinaturas
                    </Text>
                    <TextInputField
                        label="Assinatura do Motorista"
                        value={checklist.driverSignature}
                        onChangeText={(driverSignature) =>
                            setChecklist((prev) => ({ ...prev, driverSignature }))
                        }
                        placeholder="Nome ou iniciais"
                    />
                    <TextInputField
                        label="Assinatura do Responsável pela Vistoria"
                        value={checklist.inspectorSignature}
                        onChangeText={(inspectorSignature) =>
                            setChecklist((prev) => ({
                                ...prev,
                                inspectorSignature,
                            }))
                        }
                        placeholder="Nome ou iniciais"
                    />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar Checklist</Text>
                </TouchableOpacity>

                <View style={styles.spacer} />

            </ScrollView>

            {/* Floating buttons: show 'up' when scrolled, 'down' when at top and content overflows */}
            {canScroll && scrollY > thresholdScrollY && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.tint || '#0ea5e9' }]}
                    onPress={handleScrollToTop}
                    accessibilityLabel="Subir ao topo"
                >
                    <Text style={[styles.fabText]}>↑</Text>
                </TouchableOpacity>
            )}

            {canScroll && scrollY <= thresholdScrollY && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.tint || '#0ea5e9' }]}
                    onPress={handleScrollToEnd}
                    accessibilityLabel="Ir para o fim"
                >
                    <Text style={[styles.fabText]}>↓</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerBack: {
        position: 'absolute',
        left: 12,
        top: 12,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 6,
    },
    backText: {
        fontWeight: '600',
    },
    formSection: {
        marginHorizontal: 12,
        marginVertical: 16,
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    saveButton: {
        marginHorizontal: 16,
        marginVertical: 16,
        paddingVertical: 14,
        backgroundColor: '#0ea5e9',
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    spacer: {
        height: 20,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 90,
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    fabText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    imagesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        flexWrap: 'nowrap',
    },
    thumbsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    imagesRowWeb: {
        // kept for backward compatibility but not used for layout now
    },
    thumbContainer: {
        width: 72,
        height: 72,
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e6e6e6',
        backgroundColor: '#fff',
        elevation: 2,
    },
    thumb: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeThumb: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeThumbText: {
        color: '#fff',
        fontWeight: '700',
        lineHeight: 18,
    },
    addImageButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
        minHeight: 44,
    },
    addButtonWrapper: {
        marginTop: 6,
        marginBottom: 8,
        alignItems: 'center',
    },
    addButtonWrapperWeb: {
        width: '100%',
        alignSelf: 'stretch',
        paddingHorizontal: 8,
    },
    addImagePlus: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        marginRight: 8,
    },
    addImageText: {
        color: '#fff',
        fontWeight: '700',
    },
    previewContainer: {
        marginTop: 8,
        marginBottom: 12,
        paddingLeft: 4,
    },
    previewCard: {
        width: 250,
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    previewImage: {
        width: 250,
        height: 150,
        resizeMode: 'cover',
        backgroundColor: '#f6f6f6',
    },
    previewFooter: {
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    previewLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    previewRemove: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.06)'
    },
    previewRemoveText: {
        fontSize: 12,
        color: '#d00',
        fontWeight: '700',
    },
});
