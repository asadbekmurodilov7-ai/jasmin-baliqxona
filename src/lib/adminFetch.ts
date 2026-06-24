const TOKEN_KEY = 'jasmin_admin_token';

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setAdminToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearAdminToken = () => localStorage.removeItem(TOKEN_KEY);

export function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
