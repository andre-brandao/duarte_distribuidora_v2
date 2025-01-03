import { eq } from "drizzle-orm";
import { centralDb } from "../db/central";
import { tenants } from "$db/central/schema";
import { getTenantDbClient } from "./init-db";
import { getDomainAndType } from "$lib/utils";

export async function getTenant(host: string) {
  const { domain, type } = getDomainAndType(host);


  if (type === "appDomain") return null;

  let databaseName: string = "";
  let tenant;
  if (type === "subdomain") {
    tenant = await centralDb.query.tenants.findFirst({
      where: eq(tenants.subdomain, domain.toLocaleLowerCase()),
      // columns: {
      //   tenantId: true,
      //   name: true,
      //   subdomain: true,
      //   createdAt: true,
      //   databaseName: true,
      // },
    });

    if (!tenant) return null;
    databaseName = tenant.databaseName;
  } 


  const tenantDb = getTenantDbClient(databaseName);
  return { tenantDb, tenantInfo: tenant };
}
