import type { Metadata } from "next";
import { CartScreen } from "@/features/cart/cart-screen";
export const metadata: Metadata = { title: "Your Cart", robots: { index: false, follow: false } };
export default function CartPage() { return <CartScreen />; }
