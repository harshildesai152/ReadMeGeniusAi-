
export interface User {
  id: string;
  fullName: string;
  email: string;
  hashedPassword?: string; // Will be present for normal signup
  phone: string;
  verified: boolean;
  provider?: 'google' | 'email'; // To distinguish Google mock users
}

export interface PendingOTP {
  email: string;
  otp: string;
  expires: number; // timestamp
}

const USERS_KEY = 'auth_users';
const PENDING_OTP_KEY = 'auth_pendingOtp';
const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_COOKIE_NAME = 'readme_genius_session_email';

// --- Cookie Helper Functions ---
function setCookie(name: string, value: string, days?: number): void {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';
}
// --- End Cookie Helper Functions ---


// Helper to safely parse JSON from localStorage
function getJSONItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error parsing localStorage item ${key}:`, e);
    localStorage.removeItem(key); // Clear corrupted item
    return null;
  }
}

// Helper to safely stringify and set JSON to localStorage
function setJSONItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error setting localStorage item ${key}:`, e);
  }
}

export function getUsers(): User[] {
  return getJSONItem<User[]>(USERS_KEY) || [];
}

export function getUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

export function addUser(user: User): void {
  const users = getUsers();
  // Prevent duplicate emails for 'email' provider
  if (user.provider === 'email' && users.some(u => u.email.toLowerCase() === user.email.toLowerCase() && u.provider === 'email')) {
    throw new Error('User with this email already exists.');
  }
  // For Google mock, overwrite if email exists
  if (user.provider === 'google') {
    const existingUserIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingUserIndex > -1) {
      users[existingUserIndex] = user;
      setJSONItem(USERS_KEY, users);
      return;
    }
  }
  users.push(user);
  setJSONItem(USERS_KEY, users);
}

export function updateUser(updatedUser: User): void {
  let users = getUsers();
  users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
  setJSONItem(USERS_KEY, users);
}

export function isLoggedIn(): boolean {
  if (typeof document === 'undefined') return false;
  return !!getCookie(SESSION_COOKIE_NAME);
}

export function setLoggedIn(status: boolean, email?: string): void {
  if (typeof document === 'undefined') return;
  if (status && email) {
    setCookie(SESSION_COOKIE_NAME, email, 7); // Set cookie for 7 days
  } else if (!status) {
    deleteCookie(SESSION_COOKIE_NAME);
  }
}

export function getCurrentUserEmail(): string | null {
  if (typeof document === 'undefined') return null;
  return getCookie(SESSION_COOKIE_NAME);
}

export function setPendingOTP(email: string, otp: string): void {
  const pendingOtp: PendingOTP = {
    email,
    otp,
    expires: Date.now() + OTP_EXPIRATION_MS,
  };
  setJSONItem(PENDING_OTP_KEY, pendingOtp);
}

export function getPendingOTP(): PendingOTP | null {
  const pendingOtp = getJSONItem<PendingOTP>(PENDING_OTP_KEY);
  if (pendingOtp && pendingOtp.expires < Date.now()) {
    clearPendingOTP(); // OTP expired
    return null;
  }
  return pendingOtp;
}

export function clearPendingOTP(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_OTP_KEY);
}
