import LogoutButton from '@/components/logout-button';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTopBar } from './TopBarActionsContext';

const TopBar: React.FC = () => {
    const { theme } = useTheme();
    const colors = Colors[theme];

    const { state } = useTopBar();

    const resolveNode = (node?: React.ReactNode | (() => React.ReactNode)) => {
        if (typeof node === 'function') return (node as () => React.ReactNode)();
        if (typeof node === 'string') return <Text style={[styles.title, { color: colors.text }]}>{node}</Text>;
        return node;
    };

    const titleNode = resolveNode(state.title) ?? <Text style={[styles.title, { color: colors.text }]}>Checklistfleet</Text>;

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.left}>{state.left ?? titleNode}</View>
            <View style={styles.right}>
                <View style={styles.rightInner}>{resolveNode(state.right)}</View>
                <LogoutButton />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    left: {
        flex: 1,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightInner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
});

export default TopBar;
