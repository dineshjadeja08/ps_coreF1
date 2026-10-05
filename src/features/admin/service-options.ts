import { adminApi } from "@/lib/api/endpoints";
import type { AdminService } from "@/types/api";

export async function listAllServiceOptions() {
  const services: AdminService[] = [];
  let page = 1;
  while (true) {
    const response = await adminApi.listServices({ page, page_size: 100 });
    services.push(...response.results);
    if (!response.next) return services;
    page += 1;
  }
}
