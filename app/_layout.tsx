import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import TopBar from '@/components/top-bar';
import { TopBarProvider } from '@/components/TopBarActionsContext';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/hooks/useAuth';

export const unstable_settings = {
    anchor: 'auth',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <AuthProvider>
            <CustomThemeProvider>
                <ThemeProvider
                    value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
                >
                    <TopBarProvider>
                        <TopBar />
                        <Stack>
                        <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="auth"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="modal"
                            options={{ presentation: 'modal', title: 'Modal' }}
                        />
                        </Stack>
                    </TopBarProvider>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </CustomThemeProvider>
        </AuthProvider>
    );
}
