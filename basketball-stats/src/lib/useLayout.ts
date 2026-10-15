import { useWindowDimensions, ViewStyle } from 'react-native';

export const MAX_CONTENT = 820;

/** Informação de layout para adaptar o ecrã a iPhone e iPad. */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  return {
    width,
    height,
    isTablet,
    /** iPad na horizontal (ou ecrã largo): ecrã de jogo em duas colunas */
    wide: isTablet && width >= 900,
    /** Conteúdo centrado com largura máxima, para não esticar no iPad */
    content: { width: '100%', maxWidth: MAX_CONTENT, alignSelf: 'center' } as ViewStyle,
    contentWidth: Math.min(width, MAX_CONTENT),
  };
}
