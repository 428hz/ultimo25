export type Role = 'user' | 'moderator' | 'admin';

export const isModerator = (role?: Role | null) => role === 'moderator' || role === 'admin';
export const isAdmin = (role?: Role | null) => role === 'admin';