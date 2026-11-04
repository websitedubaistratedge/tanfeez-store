/** Where to go after signing in: only same-site paths, never another website. */
export const safeNext = (n?: string | null) =>
  n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") && !n.startsWith("/login") ? n : "/account";
