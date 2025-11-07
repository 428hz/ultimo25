import React from 'react';
import { Slot } from 'expo-router';

// Importante: sin redirecciones acá.
// El root guard (app/_layout) se encarga de enviar a / o a /auth/login.
export default function AuthLayout() {
  return <Slot />;
}