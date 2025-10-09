// convex/crons.ts
import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// Usar la API builder (sin argumentos)
const crons = cronJobs();

// Ejecuta todos los días a las 09:00 UTC
crons.cron(
  "sweepPremiumExpirations",
  "0 9 * * *",
  api.mutations.sweepExpirations.sweepExpirations
);

export default crons;
