import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useChecklistStorage } from '@/hooks/useChecklistStorage';
import { useTheme } from '@/hooks/useTheme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useState } from 'react';
// We'll read query params from window.location on web to support checklistId filtering
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ViewImagesPage() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const { user } = useAuth();
    const { getAllChecklists } = useChecklistStorage();
    const [images, setImages] = useState<{ uri: string; label: string }[]>([]);

    const navigation: any = useNavigation();

    // Set the header title and colors to match the app theme
    useLayoutEffect(() => {
        try {
            navigation.setOptions?.({
                title: 'Visualizador de Imagens',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
            });
        } catch (err) {
            // ignore if navigation not available
        }
    }, [navigation, colors.surface, colors.text]);

    const checklistId = Platform.OS === 'web' && typeof window !== 'undefined'
        ? (() => new URLSearchParams(window.location.search).get('checklistId'))()
        : undefined;

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            const load = async () => {
                try {
                    const data = await getAllChecklists();
                    const baseFiltered = user?.role === 'admin' ? data : data.filter((c) => c.userId === user?.id);
                    const imgs: { uri: string; label: string }[] = [];

                    if (checklistId) {
                        const c = baseFiltered.find((x) => x.id === checklistId);
                        if (c) {
                            (c.images || []).forEach((uri, idx) => {
                                imgs.push({ uri, label: `${c.plate} - ${idx === 0 ? 'Frente' : idx === 1 ? 'Trás' : `Imagem ${idx + 1}`}` });
                            });
                        }
                    } else {
                        baseFiltered.forEach((c) => {
                            (c.images || []).forEach((uri, idx) => {
                                imgs.push({ uri, label: `${c.plate} - ${idx === 0 ? 'Frente' : idx === 1 ? 'Trás' : `Imagem ${idx + 1}`}` });
                            });
                        });
                    }

                    if (mounted) setImages(imgs);
                } catch (err) {
                    console.error('Erro ao carregar imagens:', err);
                }
            };
            load();
            return () => { mounted = false; };
        }, [checklistId]),
    );

    const downloadImage = async (uri: string, label: string) => {
        if (Platform.OS !== 'web') {
            Alert.alert('Disponível no Web', 'O download de imagens está disponível na versão web.');
            return;
        }

        try {
            // Convert data URL or remote URL to blob then create download
            const res = await fetch(uri);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // sanitize filename
            const safeLabel = (label || 'image').replace(/[^a-z0-9_.-]/gi, '_');
            a.download = `${safeLabel}.jpg`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao baixar imagem:', err);
            Alert.alert('Erro', 'Não foi possível baixar a imagem');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 

            {images.length === 0 ? (
                <View style={styles.empty}><Text style={{ color: colors.placeholder }}>Nenhuma imagem disponível</Text></View>
            ) : (
                <ScrollView contentContainerStyle={styles.grid}>
                    {images.map((img, i) => (
                        <View key={img.uri + i} style={styles.card}>
                            <Image source={{ uri: img.uri }} style={styles.image} />
                            <Text style={[styles.label, { color: colors.text }]}>{img.label}</Text>
                            <TouchableOpacity
                                style={[styles.downloadButton, { backgroundColor: colors.tint || '#0ea5e9' }]}
                                onPress={() => downloadImage(img.uri, img.label)}
                            >
                                <Text style={styles.downloadButtonText}>Baixar</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: 1 },
    title: { fontSize: 20, fontWeight: '700' },
    subtitle: { fontSize: 13, marginTop: 4 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    grid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
    card: { width: 260, margin: 8, alignItems: 'center' },
    image: { width: 250, height: 150, borderRadius: 10, backgroundColor: '#f6f6f6' },
    label: { marginTop: 8, fontWeight: '600' },
    downloadButton: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    downloadButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
});
