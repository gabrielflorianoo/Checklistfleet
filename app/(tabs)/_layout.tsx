import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,

                tabBarStyle: {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    borderTopColor: Colors[colorScheme ?? 'light'].border,
                },
            }}
        >
            <Tabs.Screen
                name="checklist"
                options={{
                    title: 'Checklists',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="checkmark.circle.fill" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="admin"
                options={{
                    title: 'Admin',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="gearshape.fill" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
