export const DEFAULT_COOKIE_OPTIONS = {
  path: '/',
  secure: true,
  sameSite: 'none' as const,
  // no maxAge, so its a session cookie
}
