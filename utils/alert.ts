import { Alert, Platform } from 'react-native';

export const confirm = (title: string, message?: string, okText = 'OK') => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // window.confirm returns boolean
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }

  return new Promise<boolean>((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: okText, onPress: () => resolve(true) },
    ]);
  });
};

export const show = (title: string, message?: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // On web just show a simple alert
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  Alert.alert(title, message);
};

export default { confirm, show };
