import React from 'react';
import { View, Text, Pressable } from 'react-native';

declare global {
  var __RAW_TEXT_PATCH_INSTALLED__: boolean | undefined;
}

if (!global.__RAW_TEXT_PATCH_INSTALLED__) {
  global.__RAW_TEXT_PATCH_INSTALLED__ = true;

  const OrigCreate = React.createElement;

  const isContainer = (type: any) =>
    type === View ||
    type === Pressable ||
    (typeof type === 'function' &&
      (
        type.displayName?.includes('View') ||
        type.displayName?.includes('Pressable') ||
        type.displayName?.includes('Touchable') ||
        type.name?.includes('View') ||
        type.name?.includes('Pressable') ||
        type.name?.includes('Touchable')
      ));

  function wrapNode(node: any, keyBase: string, idx: number): any {
    if (node == null || node === false) return node;

    if (typeof node === 'string' || typeof node === 'number') {
      return OrigCreate(Text, { key: `${keyBase}${idx}` }, String(node));
    }

    if (Array.isArray(node)) {
      return node.map((n, i) => wrapNode(n, keyBase + idx + '-', i));
    }

    if (node?.type === React.Fragment && node.props?.children) {
      const fragChildren = React.Children
        .toArray(node.props.children)
        .map((c, i) => wrapNode(c, keyBase + 'f' + idx + '-', i));
      return OrigCreate(React.Fragment, { key: `${keyBase}${idx}` }, ...fragChildren);
    }

    return node;
  }

  function patchedCreateElement(type: any, props: any, ...children: any[]) {
    try {
      if (children.length && isContainer(type)) {
        const flat = React.Children.toArray(children);
        const fixed = flat.map((c, i) => wrapNode(c, 'rawtxt-', i));
        return OrigCreate(type, props, ...fixed);
      }
    } catch (e) {
      if (__DEV__) console.warn('[rawTextPatch] fallo', e);
    }
    return OrigCreate(type, props, ...children);
  }

  // @ts-ignore override intencional
  React.createElement = patchedCreateElement;

  if (__DEV__) console.log('[rawTextPatch] instalado');
}