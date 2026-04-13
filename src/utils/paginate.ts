import type { SonarClient } from '../types';

interface PagedResponse {
  paging?: {
    pageIndex: number;
    pageSize: number;
    total: number;
  };
  [key: string]: unknown;
}

/**
 * Generic pagination helper for SonarQube APIs that use page/pageSize cursor style.
 *
 * @param client    HTTP client
 * @param path      API path
 * @param params    Base query parameters; `ps` (page size) should already be set
 * @param itemsKey  Key inside the response body that holds the items array
 */
async function paginate<T>(
  client: SonarClient,
  path: string,
  params: Record<string, unknown>,
  itemsKey: string,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const data = await client.get<PagedResponse>(path, { ...params, p: page });
    const pageItems = (data[itemsKey] as T[] | undefined) ?? [];
    items.push(...pageItems);

    const { pageIndex = 0, pageSize = 0, total = 0 } = data.paging ?? {};
    if (!total || pageIndex * pageSize >= total) break;

    page++;
  }

  return items;
}

export default paginate;
