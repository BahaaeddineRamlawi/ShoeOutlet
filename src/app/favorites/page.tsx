"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "./favorites.css";

type Product = {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  imageUrl: string;
  gender: string;
  categories?: string[];
};

export default function FavoritesPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async (showSpinner: boolean = false) => {
    try {
      if (showSpinner) setIsLoading(true);

      const savedFavorites: string[] = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );

      const querySnapshot = await getDocs(collection(db, "products"));
      const products: Product[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));
      setAllProducts(products);

      const matched = products.filter((p) => savedFavorites.includes(p.id));
      setFavoriteProducts(matched);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true); // Initial load with spinner

    const handleUpdate = () => fetchData(false); // Updates without spinner

    window.addEventListener("favoritesUpdated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "favorites") handleUpdate();
    });

    return () => {
      window.removeEventListener("favoritesUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <main className="favorites-page">
      <div className="nav-background">
        <NavBar />
      </div>
      <div className="favorites-products">
        <h2 className="section-title">Your Favorite Shoes</h2>
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your favorites...</p>
          </div>
        ) : favoriteProducts.length > 0 ? (
          <div className="product-grid">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="empty-favorite-message ">
            You have no favorite shoes yet.
          </p>
        )}
      </div>
      <Footer />
    </main>
  );
}
