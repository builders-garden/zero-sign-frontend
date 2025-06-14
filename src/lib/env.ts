import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// https://env.t3.gg/docs/nextjs
export const env = createEnv({
  server: {
    TURSO_DATABASE_URL: z.string().min(1),
    TURSO_AUTH_TOKEN: z.string().min(1),
  },
  client: {
    //NEXT_PUBLIC_URL: z.string().min(1),
    //NEXT_PUBLIC_APP_ENV: z
    //  .enum(["development", "production"])
    //  .optional()
    //  .default("development"),
    //NEXT_PUBLIC_GATEWAY_URL: z.string().min(1),
    //NEXT_PUBLIC_SMART_CONTRACT_ADDRESS: z.string().min(1),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    NEXT_PUBLIC_SMART_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS,
  },
});
