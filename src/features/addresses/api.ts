import { addressApi, catalogueApi } from "@/lib/api/endpoints";

export const addressesApi = {
  ...addressApi,
  checkServiceability: catalogueApi.checkServiceArea,
};
