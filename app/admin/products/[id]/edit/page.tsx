import { notFound } from "next/navigation";
import { listCategories } from "@/lib/categories";
import { getProductById } from "@/lib/products";
import {
  ProductForm,
  type ProductFormValues,
} from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    listCategories(),
    getProductById(id),
  ]);

  if (!product) notFound();

  const specs = product.specs as Record<string, string>;

  const initialValues: ProductFormValues = {
    name: product.name,
    brand: product.brand,
    categoryId: product.categoryId,
    condition: product.condition,
    price: product.price.toString(),
    discountPrice: product.discountPrice?.toString() ?? "",
    stockQuantity: String(product.stockQuantity),
    processor: specs.processor ?? "",
    ram: specs.ram ?? "",
    storage: specs.storage ?? "",
    screenSize: specs.screen_size ?? "",
    gpu: specs.gpu ?? "",
    os: specs.os ?? "",
    battery: specs.battery ?? "",
    description: product.description,
    status: product.status,
    images: product.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
  };

  return (
    <div>
      <h1 className="text-primary text-2xl font-bold">Edit product</h1>
      <p className="text-muted-foreground mt-1 text-sm">{product.name}</p>
      <div className="mt-6 max-w-3xl">
        <ProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          initialValues={initialValues}
          productId={product.id}
        />
      </div>
    </div>
  );
}
