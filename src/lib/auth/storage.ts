
import { hashPasswordSync, comparePasswordSync } from './password';

export interface User {
  id: string;
  fullName: string; // Will store hashed value
  email: string;    // Will store hashed value
  phone: string;    // Will store hashed value
  hashedPassword?: string;
  verified: boolean;
  provider?: 'google' | 'email';
}

export interface PendingOTP {
  email: string; // This email for OTP reference should remain plain
  otp: string;
  expires: number; // timestamp
}

const USERS_KEY = 'auth_users';
const PENDING_OTP_KEY = 'auth_pendingOtp';
const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_COOKIE_NAME = 'readme_genius_session_email'; // This will store plain email for session key

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

export function getUserByEmail(emailToCompare: string): User | undefined {
  const users = getUsers();
  // Iterate and compare hashed email with the plain text email provided
  for (const user of users) {
    if (user.provider === 'email' || user.provider === 'google') { // Google mock also stores hashed email now
        // user.email is the stored hash. emailToCompare is plain text.
        if (comparePasswordSync(emailToCompare, user.email)) {
            return user;
        }
    }
  }
  return undefined;
}

export function addUser(user: User): void {
  const users = getUsers();
  
  // Check for existing user by comparing hash of provided plain email
  // This check needs to iterate and compare hashes.
  let emailExists = false;
  for (const existingUser of users) {
    if (comparePasswordSync(user.email, existingUser.email)) { // user.email is plain text here before hashing
      emailExists = true;
      break;
    }
  }

  if (user.provider === 'email' && emailExists) {
    throw new Error('User with this email already exists.');
  }
  
  const userToStore: User = {
    ...user,
    fullName: hashPasswordSync(user.fullName),
    email: hashPasswordSync(user.email), // Hash the plain email
    phone: hashPasswordSync(user.phone),
    // hashedPassword is already hashed by SignupForm
  };

  if (user.provider === 'google') {
    const existingUserIndex = users.findIndex(u => comparePasswordSync(user.email, u.email)); // user.email is plain text from mock
    if (existingUserIndex > -1) {
      users[existingUserIndex] = userToStore;
      setJSONItem(USERS_KEY, users);
      return;
    }
  }
  
  users.push(userToStore);
  setJSONItem(USERS_KEY, users);
}

export function updateUser(updatedUser: User): void {
  let users = getUsers();
  users = users.map(user => {
    if (user.id === updatedUser.id) {
      const userToSave = { ...user }; // Start with existing (hashed) values

      // If updatedUser fields are provided and look like plain text (not bcrypt hashes), re-hash them.
      // This logic assumes dashboard sends plain text for editable fields.
      // Bcrypt hashes start with '$2a$', '$2b$', or '$2y$'.
      if (updatedUser.fullName && (user.fullName !== updatedUser.fullName)) {
         userToSave.fullName = hashPasswordSync(updatedUser.fullName);
      }
      if (updatedUser.phone && (user.phone !== updatedUser.phone)) {
         userToSave.phone = hashPasswordSync(updatedUser.phone);
      }
      // Email is not typically editable on the dashboard in this mock. Password change is a separate flow.
      // If email were editable, it would need similar re-hashing logic.
      // If password were editable, it also needs re-hashing.
      userToSave.verified = updatedUser.verified; // Ensure verification status is preserved/updated
      userToSave.provider = updatedUser.provider;

      return userToSave;
    }
    return user;
  });
  setJSONItem(USERS_KEY, users);
}

export function isLoggedIn(): boolean {
  if (typeof document === 'undefined') return false;
  return !!getCookie(SESSION_COOKIE_NAME);
}

export function setLoggedIn(status: boolean, email?: string): void {
  if (typeof document === 'undefined') return;
  if (status && email) {
    // The email stored in the cookie for session tracking should be plain text,
    // as it's just an identifier for the active session, not the sensitive stored version.
    setCookie(SESSION_COOKIE_NAME, email, 7); 
  } else if (!status) {
    deleteCookie(SESSION_COOKIE_NAME);
  }
}

export function getCurrentUserEmail(): string | null {
  if (typeof document === 'undefined') return null;
  // This returns the plain text email used to identify the session
  return getCookie(SESSION_COOKIE_NAME);
}

export function setPendingOTP(email: string, otp: string): void {
  const pendingOtp: PendingOTP = {
    email, // Plain email for OTP mapping
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
