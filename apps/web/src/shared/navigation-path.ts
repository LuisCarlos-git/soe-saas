export function normalizeNavigationPath(pathname: string) {
  return pathname.replace(/\/+$/, "").toLowerCase() || "/";
}
