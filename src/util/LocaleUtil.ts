export function getLocale(): string {
  return localStorage.getItem("x-locale") || "cn";
}
