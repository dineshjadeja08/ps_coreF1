import type { PaginatedResponse } from "@/types/api";

export async function loadAllPages<T>(fetchPage: (page: number) => Promise<PaginatedResponse<T>>): Promise<T[]> {
  const results: T[] = [];
  let page = 1;

  while (true) {
    const response = await fetchPage(page);
    results.push(...response.results);
    if (!response.next) return results;
    page += 1;
  }
}
