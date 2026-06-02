import { Timestamp } from "firebase-admin/firestore";

export function formatDate(date: any): string | null {
  if (!date) return null;

  // Firestore Timestamp
  if (typeof date === "object" && "toDate" in date) {
    return (date as Timestamp).toDate().toISOString();
  }

  // Already string
  if (typeof date === "string") return date;

  return null;
}