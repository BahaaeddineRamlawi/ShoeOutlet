import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  offerPrice?: number;
  gender: string;
  categories: string[];
  description?: string;
  imageUrl: string;
  createdAt?: Timestamp;
}

export type ProductCardProps = {
  product: Product & { highlightedName?: React.ReactNode };
};

export type ProductCardWithSizeProps = {
  product: Product;
  onSizeChange?: (productId: string, sizes: string[]) => void;
  onQuantityChange?: (productId: string, quantity: number) => void;
  initialQuantity?: number;
  initialSizes?: string[];
};

export interface EditForm {
  id?: string;
  name: string;
  size: string;
  price: number | string;
  offerPrice?: number | string;
  gender: string;
  categories: string[];
  imageUrl: string;
}

export interface ProductForm {
  name: string;
  size: string;
  price: string;
  offerPrice?: string;
  gender: string;
  categories: string[];
  image: File | null;
}

export interface CartItem {
  id: string;
  quantity: number;
  sizes: string[];
}

export type CartProductWithSize = Product & {
  selectedSizes: string[];
  quantity: number;
};
