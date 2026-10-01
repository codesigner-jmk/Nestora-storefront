export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_kobo: number;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  category: { name: string; slug: string } | null;
  product_images: { image_url: string; alt_text: string; display_order: number }[];
  product_variants: { id: string; name: string; value: string; price_modifier_kobo: number; stock_quantity: number; sku: string }[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};
