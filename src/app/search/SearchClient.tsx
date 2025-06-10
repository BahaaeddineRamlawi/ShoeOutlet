"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Product } from "@/types/product";
import Fuse from "fuse.js";
import { GENDER_ALIASES } from "@/config/genderCategories";
import "./search.css";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase().trim() || "";
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [highlightMap, setHighlightMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const products: Product[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));

      let matched: Product[] = [];
      let highlights: Record<string, string> = {};

      const matchedGender = GENDER_ALIASES[query];
      if (matchedGender) {
        matched = products.filter(
          (product) => product.gender === matchedGender
        );
        highlights = Object.fromEntries(
          matched.map((p) => [p.id, matchedGender])
        );
      } else {
        const fuse = new Fuse(products, {
          keys: ["name", "categories"],
          threshold: 0.2,
          minMatchCharLength: 3,
          includeMatches: true,
          ignoreLocation: true,
        });
        const results = fuse.search(query);

        results.sort((a, b) => {
          const aHasNameMatch = a.matches?.some((m) => m.key === "name")
            ? 0
            : 1;
          const bHasNameMatch = b.matches?.some((m) => m.key === "name")
            ? 0
            : 1;
          return aHasNameMatch - bHasNameMatch;
        });

        matched = results.map((res) => res.item);
        highlights = Object.fromEntries(
          results.map((res) => [
            res.item.id,
            res.matches?.[0]?.value?.substring(
              res.matches[0].indices[0][0],
              res.matches[0].indices[0][1] + 1
            ) || query,
          ])
        );
      }

      setFilteredProducts(matched);
      setHighlightMap(highlights);
      setIsLoading(false);
    };

    fetchData();
  }, [query]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const highlightMatch = (text: string, highlight: string) => {
    const regex = new RegExp(`(${highlight})`, "gi");
    return text
      .split(regex)
      .map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i}>{part}</mark>
        ) : (
          part
        )
      );
  };

  return (
    <main className="search-page">
      <NavBar />
      <div className="search-products">
        <h2 className="section-title">
          Search Results for &quot;{query}&quot;
        </h2>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading results...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.slice(0, visibleCount).map((product) => (
              <div key={product.id} className="highlight-card">
                <ProductCard
                  product={{
                    ...product,
                    highlightedName: highlightMap[product.id]
                      ? highlightMatch(product.name, highlightMap[product.id])
                      : undefined,
                    name: product.name,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-search-message">
            No products matched your search.
          </p>
        )}
      </div>
      {visibleCount < filteredProducts.length && (
        <div className="button-container">
          <button onClick={handleShowMore} className="show-more-button">
            Show More
          </button>
        </div>
      )}
      <Footer />
    </main>
  );
}
