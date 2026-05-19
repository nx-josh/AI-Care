import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
  DATABASE_URL: z.string().url().optional(),
  GAME_API_BASE_URL: z.string().url().optional(),
  GAME_API_KEY: z.string().optional(),
  USE_MOCK_GAME_API: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

export const env = envSchema.parse({
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
  DATABASE_URL: process.env.DATABASE_URL,
  GAME_API_BASE_URL: process.env.GAME_API_BASE_URL,
  GAME_API_KEY: process.env.GAME_API_KEY,
  USE_MOCK_GAME_API: process.env.USE_MOCK_GAME_API,
});
