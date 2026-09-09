import { z } from "zod";

const itemSchema = z.object({
  id: z.string().min(1), slug: z.string().min(1), name: z.string().min(1),
  price: z.number().finite().nonnegative().nullable(), bookingId: z.string().min(1).optional(),
});
export type CartItem = z.infer<typeof itemSchema>;
export function parseCart(raw: string): CartItem[] {
  try {
    const result = z.array(itemSchema).max(100).safeParse(JSON.parse(raw));
    return result.success ? Array.from(new Map(result.data.map((item) => [item.id, item])).values()) : [];
  } catch { return []; }
}
export function mergeCart(existing: CartItem[], added: CartItem[]): CartItem[] {
  const merged = new Map(existing.map((item) => [item.id, item]));
  for (const item of added) if (!merged.has(item.id)) merged.set(item.id, item);
  return Array.from(merged.values()).slice(0, 100);
}
