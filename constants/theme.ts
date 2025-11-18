/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#64b5f6';

export const Colors = {
    light: {
        text: '#11181C',
        background: '#f9fafb',
        surface: '#ffffff',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
        border: '#e5e7eb',
        placeholder: '#9ca3af',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
    },
    dark: {
        text: '#ecedee',
        background: '#0f172a',
        surface: '#1e293b',
        tint: tintColorDark,
        icon: '#9ba1a6',
        tabIconDefault: '#9ba1a6',
        tabIconSelected: tintColorDark,
        border: '#334155',
        placeholder: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
    },
};
export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: 'system-ui',
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: 'ui-serif',
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: 'ui-rounded',
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded:
            "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono:
            "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
