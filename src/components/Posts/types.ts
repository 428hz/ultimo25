export type ProfileSlim = { username: string; avatar_url: string | null };

export type Comment = {
  id: string; // normalizamos a string para comparaciones en UI
  content: string;
  author_id?: string;
  author?: ProfileSlim | null;
  created_at?: string | null;
};

export type PostData = {
  id: string | number; // puede venir en string; lo normalizamos a number para queries
  author_id: string;
  media_url: string | null;
  text_content: string | null;
  profiles?: ProfileSlim;
};

export type PostProps = {
  postData: PostData;
  onDelete?: (id: string | number) => void;
};