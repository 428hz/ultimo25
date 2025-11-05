import React from 'react';
import { Platform, Text, View } from 'react-native';

// Solo en web y en desarrollo
declare const __DEV__: boolean;

if (typeof window !== 'undefined' && __DEV__ && Platform.OS === 'web') {
  const origCreateElement = React.createElement;

  React.createElement = function patchedCreateElement(type: any, props: any, ...children: any[]) {
    try {
      // Identificamos el View nativo de RN Web
      if (type === View || (type?.displayName === 'View' && type?.name === 'View')) {
        const offenders: Array<{ index: number; value: string }> = [];

        // Aplana y revisa hijos
        const flat = React.Children.toArray(children);
        flat.forEach((child, i) => {
          if (typeof child === 'string' || typeof child === 'number') {
            const v = String(child).trim();
            if (v.length > 0) offenders.push({ index: i, value: v });
          }
        });

        if (offenders.length) {
          // Log bien visible + traza a tu fuente
          // En Chrome: haz clic en el enlace a la derecha para saltar a la línea original (con sourcemaps).
          // Si no se resuelve, usa el botón "trace" que imprime call stack.
          // Busca una de tus funciones (Post..., Header..., Meta...) en la traza.
          console.error('[RAW TEXT IN <View>] Encontrado texto directo dentro de <View>:', offenders);
          console.trace('[RAW TEXT IN <View>] component stack-like trace');
        }
      }
    } catch {
      // no romper el render por el logger
    }

    return (origCreateElement as any)(type, props, ...children);
  } as any;

  console.info('[detectRawTextInView] activo (solo dev/web).');
}