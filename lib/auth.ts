// Authentication utilities
import { getUserByEmail, getUserById, createUser } from "./db.ts";
import type { User } from "../types.ts";

// Extend globalThis to include sessions
declare global {
  // eslint-disable-next-line no-var
  var sessions: Map<string, { userId: string; expiresAt: number }> | undefined;
}

// Simple UUID generator
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simple password hashing
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Session management - using a more persistent approach
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Use globalThis to ensure sessions persist across module reloads
if (!globalThis.sessions) {
  globalThis.sessions = new Map<string, { userId: string; expiresAt: number }>();
}

const sessions = globalThis.sessions as Map<string, { userId: string; expiresAt: number }>;

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const user: User = {
    id: generateId(),
    email,
    passwordHash,
    name,
    createdAt: new Date().toISOString(),
  };

  await createUser(user);
  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return null;
  }

  return user;
}

export function createSession(userId: string): string {
  const sessionId = generateId();
  const expiresAt = Date.now() + SESSION_DURATION;

  sessions.set(sessionId, { userId, expiresAt });

  // Clean up expired sessions
  cleanupSessions();

  return sessionId;
}

export function getSession(sessionId: string): { userId: string } | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return { userId: session.userId };
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

function cleanupSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(id);
    }
  }
}

// Middleware helper
export async function getSessionUser(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith("session="));

  if (!sessionCookie) {
    return null;
  }

  const sessionId = sessionCookie.split("=")[1];
  const session = getSession(sessionId);

  if (!session) {
    return null;
  }

  return await getUserById(session.userId);
}
