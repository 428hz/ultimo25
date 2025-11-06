export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; code?: string; message: string; raw?: unknown };

export function toUserMessage(err: any): { code?: string; message: string } {
  if (!err) return { message: 'Ocurrió un error inesperado.' };

  const code = err.code || err.status || err.name;

  switch (code) {
    case '23505':
      return { code, message: 'Ese dato ya existe. Probá con otro.' };
    case '42501':
      return { code, message: 'No tenés permisos para realizar esta acción.' };
    case 'PGRST116':
      return { code, message: 'No se encontró el recurso solicitado.' };
    case 'OVER_EMAIL_RATE_LIMIT':
      return { code, message: 'Demasiados intentos. Probá de nuevo más tarde.' };
    case 'invalid_grant':
    case 'invalid_credentials':
      return { code, message: 'Credenciales inválidas.' };
  }

  if (err?.message?.toLowerCase?.().includes('oauth')) {
    return { code, message: 'Falló el inicio con el proveedor. Intentá nuevamente.' };
  }

  return { code, message: err.message || 'Error de red o de servidor.' };
}

export async function safeCall<T>(
  op: () => Promise<{ data: T; error: any }>
): Promise<Result<T>> {
  try {
    const { data, error } = await op();
    if (error) {
      const { code, message } = toUserMessage(error);
      return { ok: false, code, message, raw: error };
    }
    return { ok: true, data };
  } catch (e) {
    const { code, message } = toUserMessage(e);
    return { ok: false, code, message, raw: e };
  }
}