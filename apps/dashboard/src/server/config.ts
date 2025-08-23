import { env as baseEnv, configSchema as BaseSchema } from "@org/config";
import { z } from "zod";

// extend base schema with app-specific vars
const AppSchema = BaseSchema.extend({
  SERVICE_NAME: z.string().default("dashboard"),
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000")
});

export const env = AppSchema.parse(process.env);
// re-export if helpful
export type Env = z.infer<typeof AppSchema>;