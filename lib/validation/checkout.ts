import { z } from "zod";

// Nigerian mobile numbers: 0/234/+234 followed by a network prefix (7,8,9)
// and a second digit (0 or 1), then 8 more digits — e.g. 08012345678.
const NIGERIAN_PHONE_REGEX = /^(?:\+234|234|0)[789][01]\d{8}$/;

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const checkoutInputSchema = z
  .object({
    customerName: z.string().trim().min(1, "Name is required").max(200),
    customerEmail: z.string().trim().email("Enter a valid email address"),
    customerPhone: z
      .string()
      .trim()
      .regex(NIGERIAN_PHONE_REGEX, "Enter a valid Nigerian phone number"),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    deliveryAddress: z.string().trim().max(500).optional(),
    items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
  })
  .refine(
    (data) =>
      data.deliveryMethod !== "delivery" ||
      (data.deliveryAddress && data.deliveryAddress.length > 0),
    {
      message: "Delivery address is required for delivery orders",
      path: ["deliveryAddress"],
    },
  );

export type CheckoutInputPayload = z.infer<typeof checkoutInputSchema>;
