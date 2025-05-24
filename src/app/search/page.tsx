"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import NavBar from "@/components/NavBar";
import "./search.css";

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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const savedFavorites: string[] = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );
      setFavorites(savedFavorites);

      const querySnapshot = await getDocs(collection(db, "products"));
      const products: Product[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));

      const matched = products.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
      setFilteredProducts(matched);
      setIsLoading(false);
    };

    fetchData();
  }, [query]);

  return (
    <main className="search-page">
      <div className="nav-background">
        <NavBar />
      </div>
      <div className="search-products">
        <h2 className="section-title">Search Results for "{query}"</h2>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading results...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="empty-search-message ">
            No products matched your search.
          </p>
        )}
      </div>
    </main>
  );
}
