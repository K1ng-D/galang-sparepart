export type UserRole = "admin" | "user";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}
