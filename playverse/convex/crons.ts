// convex/crons.ts
import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

/**
 * Barrido rápido cada 10 minutos para expirar planes vencidos
 * y bajar el rol si corresponde.
 */
crons.cron(
  "sweep-expirations-every-10-min",
  "*/10 * * * *",
  api.mutations.sweepExpirations.sweepExpirations
);

/**
 * Barrido de seguridad diario a medianoche (UTC) por si algo quedó pendiente.
 */
crons.cron(
  "sweep-expirations-midnight",
  "0 0 * * *",
  api.mutations.sweepExpirations.sweepExpirations
);

export default crons;