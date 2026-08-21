import { twMerge, type ClassNameValue } from "tailwind-merge";

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(...inputs);
}

export * from "./sanitize";
export * from "./compressImage";
export * from "./image-validate";
