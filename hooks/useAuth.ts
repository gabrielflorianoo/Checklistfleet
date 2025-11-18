import {
    AuthState,
    LoginCredentials,
    RegisterCredentials,
    User,
} from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    Platform
} from 'react-native';

const STORAGE_KEY = 'checklistfleet_auth';
const USERS_KEY = 'checklistfleet_users';

// Helper para acessar storage (SecureStore no native, AsyncStorage no web)
// ... (getStorageItem, setStorageItem, deleteStorageItem permanecem iguais)
const getStorageItem = async (key: string): Promise<string | null> => {
    try {
        if (Platform.OS === 'web') {
            return await AsyncStorage.getItem(key);
        } else {
            return await SecureStore.getItemAsync(key);
        }
    } catch (error) {
        console.error(`Erro ao recuperar ${key}:`, error);
        return null;
    }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
    try {
        if (Platform.OS === 'web') {
            await AsyncStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    } catch (error) {
        console.error(`Erro ao salvar ${key}:`, error);
    }
};

const deleteStorageItem = async (key: string): Promise<void> => {
    try {
        if (Platform.OS === 'web') {
            await AsyncStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    } catch (error) {
        console.error(`Erro ao deletar ${key}:`, error);
    }
};

// =========================================================================
// CORREÇÃO: Usando btoa/atob nativos em vez de Buffer, com codificação segura
// =========================================================================

const generateJWT = (user: User): string => {
    const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Date.now(),
    };

    // Conversão JSON -> string UTF-8 -> Base64
    const jsonString = JSON.stringify(payload);

    // Base64 encode (btoa é global em RN/Web)
    return btoa(unescape(encodeURIComponent(jsonString)));
};

const decodeJWT = (token: string): User | null => {
    try {
        // Base64 decode (atob é global em RN/Web)
        const jsonString = decodeURIComponent(escape(atob(token)));

        const payload = JSON.parse(jsonString);

        return {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            createdAt: new Date().toISOString(), // Nota: O timestamp de criação deve vir do payload
        };
    } catch (error) {
        console.error('Erro ao decodificar JWT:', error);
        return null;
    }
};
// =========================================================================

const initializeDefaultAdmin = async () => {
    try {
        const usersJson = await getStorageItem(USERS_KEY);
        if (!usersJson) {
            const adminUser: User = {
                id: 'admin-001',
                email: 'admin@example.com',
                name: 'Administrador',
                role: 'admin',
                createdAt: new Date().toISOString(),
            };
            await setStorageItem(USERS_KEY, JSON.stringify([adminUser]));
        }
    } catch (error) {
        console.error('Erro ao inicializar admin:', error);
    }
};

type AuthContextType = AuthState & {
    loading: boolean;
    register: (c: RegisterCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
    login: (c: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useProvideAuth = (): AuthContextType => {
    const [authState, setAuthState] = useState<AuthState>({
        token: null,
        user: null,
        isAuthenticated: false,
    });
    const [loading, setLoading] = useState(true);

    // Carregar auth state do storage ao iniciar
    useEffect(() => {
        const loadAuthState = async () => {
            try {
                await initializeDefaultAdmin();

                const token = await getStorageItem(STORAGE_KEY);
                if (token) {
                    const user = decodeJWT(token);
                    if (user) {
                        setAuthState({
                            token,
                            user,
                            isAuthenticated: true,
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar auth state:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAuthState();
    }, []);

    const register = useCallback(async (credentials: RegisterCredentials) => {
        try {
            // Recuperar usuários existentes
            const usersJson = await getStorageItem(USERS_KEY);
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];

            // Verificar se email já existe
            if (users.some((u) => u.email === credentials.email)) {
                throw new Error('Email já registrado');
            }

            // Criar novo usuário
            const newUser: User = {
                id: Date.now().toString(),
                email: credentials.email,
                name: credentials.name,
                role: 'user', // Novo usuário começa como 'user', não 'admin'
                createdAt: new Date().toISOString(),
            };

            // Salvar usuário
            users.push(newUser);
            await setStorageItem(USERS_KEY, JSON.stringify(users));

            // Gerar JWT
            const token = generateJWT(newUser);
            await setStorageItem(STORAGE_KEY, token);

            setAuthState({
                token,
                user: newUser,
                isAuthenticated: true,
            });

            return { success: true, user: newUser };
        } catch (error) {
            console.error('Erro ao registrar:', error);
            return { success: false, error: (error as Error).message };
        }
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            // Recuperar usuários salvos
            const usersJson = await getStorageItem(USERS_KEY);
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];

            // Encontrar usuário (em produção, seria verificação de senha com hash)
            const user = users.find((u) => u.email === credentials.email);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // NOTE: A lógica de senha (credentials.password) está faltando, 
            // assumindo que esta é uma simulação de autenticação baseada apenas no email.
            // Para produção, você precisaria de uma lógica de verificação de senha salva.

            // Gerar JWT
            const token = generateJWT(user);
            await setStorageItem(STORAGE_KEY, token);

            setAuthState({
                token,
                user,
                isAuthenticated: true,
            });

            return { success: true, user };
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return { success: false, error: (error as Error).message };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await deleteStorageItem(STORAGE_KEY);
            setAuthState({
                token: null,
                user: null,
                isAuthenticated: false,
            });
            return { success: true };
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return { success: false, error: (error as Error).message };
        }
    }, []);

    return {
        ...authState,
        loading,
        register,
        login,
        logout,
    };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const value = useProvideAuth();
    return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
};