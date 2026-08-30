import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).nullable().optional(),
});

export type CategoryInputPayload = z.infer<typeof categoryInputSchema>;

export const categoryReorderSchema = z.object({
  direction: z.enum(["up", "down"]),
});
