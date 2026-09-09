export type Role = "student" | "parent" | "teacher" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  role: Role;
};

export const DEMO_USERS: SessionUser[] = [
  { id: "student-1", name: "طالب تجريبي", role: "student" },
  { id: "parent-1", name: "ولي أمر تجريبي", role: "parent" },
  { id: "teacher-1", name: "معلم تجريبي", role: "teacher" },
  { id: "admin-1", name: "مدير النظام", role: "admin" },
];

export function getDemoUser(role: Role = "student") {
  return DEMO_USERS.find((u) => u.role === role) ?? DEMO_USERS[0];
}

export function canAccess(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}
