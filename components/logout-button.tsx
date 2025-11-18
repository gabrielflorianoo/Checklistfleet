import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const LogoutButton: React.FC = () => {
    const { logout } = useAuth();
    const { theme } = useTheme();
    const colors = Colors[theme];
    const router = useRouter();

    const doLogout = async () => {
        try {
            const result = await logout();
            if (result && (result as any).success === false) {
                Alert.alert('Erro', (result as any).error || 'Não foi possível sair');
                return;
            }
            router.replace('/auth');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Erro ao efetuar logout:', err);
            Alert.alert('Erro', 'Não foi possível sair no momento');
        }
    };

    const handlePress = () => {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const ok = window.confirm('Tem certeza que deseja sair?');
            if (!ok) return;
            void doLogout();
            return;
        }

        Alert.alert('Logout', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: () => void doLogout() },
        ]);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.button, { backgroundColor: colors.danger || '#dc2626' }]}
            accessibilityLabel="Sair"
        >
            <Text style={styles.text}>Sair</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        minWidth: 64,
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
});

export default LogoutButton;
