import { jwtDecode } from 'jwt-decode';

export function getDecodedToken(): any | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (err) {
    console.warn('Lỗi decode token:', err);
    return null;
  }
}

export function getUserIdFromToken(): number | null {
  const decoded = getDecodedToken();
  return decoded?.userID ?? null;
}

export function getUsernameFromToken(): string | null {
  const decoded = getDecodedToken();
  return decoded?.username ?? null;
}

export function getAvatarFromToken(): string | null {
  const decoded = getDecodedToken();
  return decoded?.avatar ?? null;
}

export function getRoleFromToken(): string | null {
  const decoded = getDecodedToken();
  return decoded?.role ?? null;
}
