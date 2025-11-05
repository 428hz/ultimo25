import { supabase } from '@/services/supabaseClient';

// Sube un File (web) o Blob (nativo) y devuelve la URL pública
export async function uploadObjectToBucket(params: {
  bucket: 'posts' | 'avatars';
  path: string; // ejemplo: `${userId}/${Date.now()}.jpg`
  data: File | Blob;
  contentType?: string;
}) {
  const { bucket, path, data, contentType } = params;

  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, data, {
      cacheControl: '3600',
      upsert: true,
      contentType: contentType,
    });

  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return pub?.publicUrl || '';
}

export async function blobFromUri(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return await res.blob();
}