export type UserRole = 'ddmo' | 'citizen';

export function login(role: UserRole): void {
  localStorage.setItem('siera_role', role);
}

export function logout(): void {
  localStorage.removeItem('siera_role');
}

export function getRole(): UserRole | null {
  const role = localStorage.getItem('siera_role');
  if (role === 'ddmo' || role === 'citizen') {
    return role;
  }
  return null;
}
