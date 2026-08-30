import { z } from "zod";

export const productConditionSchema = z.enum(["new", "uk_used", "refurbished"]);
export const productStatusSchema = z.enum(["active", "draft", "sold_out"]);

export const productSpecsSchema = z.object({
  processor: z.string().trim().min(1, "Processor is required"),
  ram: z.string().trim().min(1, "RAM is required"),
  storage: z.string().trim().min(1, "Storage is required"),
  screen_size: z.string().trim().min(1, "Screen size is required"),
  gpu: z.string().trim().min(1, "GPU is required"),
  os: z.string().trim().min(1, "Operating system is required"),
  battery: z.string().trim().optional().default(""),
});

export const productImageSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  isPrimary: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export const productInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    brand: z.string().trim().min(1, "Brand is required").max(100),
    categoryId: z.string().uuid("Select a category"),
    condition: productConditionSchema,
    price: z.number().positive("Price must be greater than 0"),
    discountPrice: z.number().positive().nullable(),
    stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
    specs: productSpecsSchema,
    description: z.string().trim().min(1, "Description is required"),
    status: productStatusSchema,
    images: z.array(productImageSchema).max(12, "Maximum 12 images"),
  })
  .refine(
    (data) => data.discountPrice === null || data.discountPrice < data.price,
    {
      message: "Discount price must be less than the regular price",
      path: ["discountPrice"],
    },
  );

export type ProductInputPayload = z.infer<typeof productInputSchema>;
