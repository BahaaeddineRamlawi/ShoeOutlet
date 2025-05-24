"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "./cart.css";

type Product = {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  imageUrl: string;
  gender: string;
  categories?: string[];
  quantity?: number;
};

export default function ShoppingCartPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (showSpinner: boolean = false) => {
      try {
        if (showSpinner) setIsLoading(true);

        const savedCart: string[] = JSON.parse(
          localStorage.getItem("cart") || "[]"
        );
        setCartItems(savedCart);

        const querySnapshot = await getDocs(collection(db, "products"));
        const products: Product[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));
        setAllProducts(products);

        const matched = products.filter((p) => savedCart.includes(p.id));
        const cartWithQuantity = matched.map((product) => ({
          ...product,
          quantity: savedCart.filter((id) => id === product.id).length,
        }));
        setCartProducts(cartWithQuantity);

        const total = cartWithQuantity.reduce(
          (sum, product) => sum + product.price * (product.quantity || 1),
          0
        );
        setTotalPrice(total);
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        if (showSpinner) setIsLoading(false);
      }
    };

    // Initial load shows spinner
    fetchData(true);

    // Updates skip spinner
    const handleUpdate = () => fetchData(false);

    window.addEventListener("cartUpdated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "cart") handleUpdate();
    });

    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <main className="shoppingcart-page">
      <div className="nav-background">
        <NavBar />
      </div>
      <div className="shoppingcart-products">
        <h2 className="section-title">Your Shopping Cart</h2>
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your cart...</p>
          </div>
        ) : cartProducts.length > 0 ? (
          <>
            <div className="product-grid">
              {cartProducts.map((product) => (
                <ProductCard
                  key={`${product.id}-${product.quantity}`}
                  product={product}
                />
              ))}
            </div>
            <div className="cart-summary">
              <h3>Total: ${totalPrice.toFixed(2)}</h3>
              <button className="checkout-button">Proceed to Checkout</button>
            </div>
          </>
        ) : (
          <p className="empty-cart-message">Your cart is empty.</p>
        )}
      </div>
      <Footer />
    </main>
  );
}
