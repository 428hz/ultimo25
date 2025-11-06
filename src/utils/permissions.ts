type Role = 'user' | 'moderator' | 'admin';

export function canModerate(role?: Role) {
  return role === 'moderator' || role === 'admin';
}

export function canAdmin(role?: Role) {
  return role === 'admin';
}

export function canEditOrDeletePost(opts: { role?: Role; isAuthor: boolean }) {
  if (opts.isAuthor) return true;
  return canModerate(opts.role);
}