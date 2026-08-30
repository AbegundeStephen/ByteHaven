import { z } from "zod";

export const trackOrderInputSchema = z
  .object({
    orderNumber: z.string().trim().min(1, "Order number is required"),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().min(1).optional().or(z.literal("")),
  })
  .refine((data) => !!data.email || !!data.phone, {
    message: "Enter the email or phone number used on the order",
    path: ["email"],
  });

export type TrackOrderInputPayload = z.infer<typeof trackOrderInputSchema>;
