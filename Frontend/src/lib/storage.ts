const TOKEN_KEY = "mam_token";
const USER_KEY = "mam_user";

export const storage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
  getUser(): string | null {
    return localStorage.getItem(USER_KEY);
  },
  setUser(userJson: string): void {
    localStorage.setItem(USER_KEY, userJson);
  },
  clearUser(): void {
    localStorage.removeItem(USER_KEY);
  },
  clearAuth(): void {
    this.clearToken();
    this.clearUser();
  },
};
