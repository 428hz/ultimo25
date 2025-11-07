export type ProfileSlim = { username: string; avatar_url: string | null };

export type Comment = {
  id: string;
  content: string;
  author_id?: string;
  author?: ProfileSlim | null;
  created_at?: string | null;
};

export type PostData = {
  id: string | number;
  author_id: string;
  media_url: string | null;
  text_content: string | null;
  // Permitimos también null porque los SELECT pueden traer null si aún no hay perfil asociado
  profiles?: ProfileSlim | null;
};

export type PostProps = {
  postData: PostData;
  onDelete?: (id: string | number) => void;
};