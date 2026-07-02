const KEY = "darazsmart-recent-searches";
const MAX = 6;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addRecentSearch(q: string) {
  if (typeof window === "undefined") return;
  const term = q.trim();
  if (!term) return;
  const list = getRecentSearches().filter(
    (t) => t.toLowerCase() !== term.toLowerCase()
  );
  list.unshift(term);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function clearRecentSearches() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
