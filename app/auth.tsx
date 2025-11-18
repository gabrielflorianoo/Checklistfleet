import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AuthScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];
    const { login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não conferem');
            return;
        }

        if (!isLogin && !name) {
            Alert.alert('Erro', 'Por favor, preencha seu nome');
            return;
        }

        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await login({ email, password });
            } else {
                result = await register({ email, password, name });
            }

            if (result.success) {
                Alert.alert(
                    'Sucesso',
                    isLogin ? 'Login realizado' : 'Conta criada',
                );
                router.replace('/(tabs)/checklist');
            } else {
                Alert.alert('Erro', result.error || 'Erro na autenticação');
            }
        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    const inputBgColor = colors.surface || colors.background || '#f5f5f5';
    const borderColor = colors.border || '#ddd';
    const primaryColor = colors.tint || '#007AFF';
    const buttonTextColor = '#fff';
    const placeholderColor = colors.placeholder || '#999';

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {isLogin ? 'Bem-vindo' : 'Criar Conta'}
                </Text>
                {isLogin && (
                    <Text
                        style={[
                            styles.hint,
                            { color: colors.placeholder || '#999' },
                        ]}
                    >
                        Demo: admin@example.com
                    </Text>
                )}
            </View>

            <View style={styles.form}>
                {!isLogin && (
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: inputBgColor,
                                color: colors.text,
                                borderColor: borderColor,
                            },
                        ]}
                        placeholder="Nome"
                        placeholderTextColor={placeholderColor}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!loading}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: inputBgColor,
                            color: colors.text,
                            borderColor: borderColor,
                        },
                    ]}
                    placeholder="Email"
                    placeholderTextColor={placeholderColor}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                />

                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: inputBgColor,
                            color: colors.text,
                            borderColor: borderColor,
                        },
                    ]}
                    placeholder="Senha"
                    placeholderTextColor={placeholderColor}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                />

                {!isLogin && (
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: inputBgColor,
                                color: colors.text,
                                borderColor: borderColor,
                            },
                        ]}
                        placeholder="Confirmar Senha"
                        placeholderTextColor={placeholderColor}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        editable={!loading}
                    />
                )}

                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: primaryColor,
                            opacity: loading ? 0.6 : 1,
                        },
                    ]}
                    onPress={handleAuth}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={buttonTextColor} />
                    ) : (
                        <Text
                            style={[
                                styles.buttonText,
                                { color: buttonTextColor },
                            ]}
                        >
                            {isLogin ? 'Entrar' : 'Registrar'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={{ color: colors.text }}>
                    {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        setIsLogin(!isLogin);
                        setEmail('');
                        setPassword('');
                        setConfirmPassword('');
                        setName('');
                    }}
                    disabled={loading}
                >
                    <Text
                        style={[
                            styles.link,
                            {
                                color: primaryColor,
                                opacity: loading ? 0.6 : 1,
                            },
                        ]}
                    >
                        {isLogin ? 'Registre-se' : 'Faça Login'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    hint: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    form: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    link: {
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
