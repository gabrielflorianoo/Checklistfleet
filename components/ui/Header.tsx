import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type HeaderProps = {
    title?: string;
    onBack?: () => void;
};

export const Header: React.FC<HeaderProps> = ({ title = '', onBack }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = Colors[theme];

    const handleBack = useCallback(() => {
        if (typeof onBack === 'function') {
            onBack();
            return;
        }

        if (navigation && typeof (navigation as any).goBack === 'function') {
            (navigation as any).goBack();
            return;
        }

        // fallback - no-op
        // eslint-disable-next-line no-console
        console.warn('Header: no back handler available');
    }, [onBack, navigation]);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={[styles.backText, { color: colors.text }]}>‹ Voltar</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {title}
            </Text>
            <View style={styles.rightPlaceholder} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    backText: {
        fontWeight: '600',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
    },
    rightPlaceholder: {
        width: 48,
    },
});

export default Header;
