import React from 'react';
import { Text } from 'react-native';

type Props = { children: React.ReactNode };

function wrap(node: React.ReactNode): React.ReactNode {
  // string o número sueltos → envolver en <Text>
  if (typeof node === 'string' || typeof node === 'number') {
    return <Text>{node}</Text>;
  }
  // null/undefined/boolean → dejar pasar
  if (node === null || node === undefined || typeof node === 'boolean') return node;

  // arrays → mapear recursivamente
  if (Array.isArray(node)) return node.map((n, i) => <React.Fragment key={i}>{wrap(n)}</React.Fragment>);

  // elemento React → clonar y sanear sus children
  if (React.isValidElement(node)) {
    const children = (node as any).props?.children;
    if (children === undefined) return node;
    return React.cloneElement(node as any, (node as any).props, wrap(children));
  }

  // cualquier otro tipo (símbolos, etc.)
  return node;
}

export default function SafeChildren({ children }: Props) {
  return <>{wrap(children)}</>;
}