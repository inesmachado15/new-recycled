import { Alert, AlertButton, Platform } from 'react-native';

/**
 * No browser (versão web no site), o Alert do React Native não faz nada.
 * Aqui usamos as janelas nativas do browser para as confirmações.
 */
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = [title, message].filter(Boolean).join('\n\n');
    const list = buttons ?? [];
    const actions = list.filter((b) => b.style !== 'cancel');
    if (actions.length === 0) {
      window.alert(text);
      list[0]?.onPress?.();
      return;
    }
    // Uma pergunta por ação (ex.: "Prolongamento?" e depois "Terminar jogo?")
    for (const a of actions) {
      const q = actions.length === 1 ? `${text}\n\n${a.text}?` : `${text}\n\n→ ${a.text}?`;
      if (window.confirm(q)) {
        a.onPress?.();
        return;
      }
    }
    list.find((b) => b.style === 'cancel')?.onPress?.();
  };

  (Alert as unknown as { prompt: unknown }).prompt = (
    title: string,
    message?: string,
    callback?: unknown,
    _type?: string,
    defaultValue?: string,
  ) => {
    const v = window.prompt([title, message].filter(Boolean).join('\n'), defaultValue ?? '');
    if (v != null && typeof callback === 'function') callback(v);
  };
}
