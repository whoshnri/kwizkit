import { Gender, Level, MaterialType, TransactionType } from "@/lib/generated/prisma/client";

export const genderOptions: Gender[] = ["male", "female", "other"];

export const levelOptions: Level[] = [
  "jss1",
  "jss2",
  "jss3",
  "ss1",
  "ss2",
  "ss3",
  "nd1",
  "nd2",
  "hnd1",
  "hnd2",
  "level_100",
  "level_200",
  "level_300",
  "level_400",
  "level_500",
  "postgraduate",
];

export const materialTypeOptions: MaterialType[] = [
  "slide",
  "note",
  "video",
  "audio",
  "document",
  "link",
  "other",
];

export const transactionTypeOptions: TransactionType[] = ["cr", "dr"];

export function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}
