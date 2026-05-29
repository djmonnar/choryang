import { seedProducts } from "@/data/seedProducts";
import type { Product, ProductCategory } from "@/types/product";
import { readStorage, writeStorage } from "./storage";

const KEY = "choryang.products";

export function listProducts(options?: { visibleOnly?: boolean; bookingOnly?: boolean; category?: ProductCategory | "all" }) {
  let products = readStorage<Product[]>(KEY, seedProducts);
  if (options?.visibleOnly) products = products.filter((product) => product.visible);
  if (options?.bookingOnly) products = products.filter((product) => product.bookingEnabled);
  if (options?.category && options.category !== "all") products = products.filter((product) => product.category === options.category);
  return products.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getProduct(id: string) {
  return listProducts().find((product) => product.id === id) ?? null;
}

export function saveProduct(product: Product) {
  const products = listProducts();
  const exists = products.some((item) => item.id === product.id);
  const next = exists ? products.map((item) => (item.id === product.id ? product : item)) : [...products, product];
  writeStorage(KEY, next);
  return product;
}

export function resetProducts() {
  writeStorage(KEY, seedProducts);
}
