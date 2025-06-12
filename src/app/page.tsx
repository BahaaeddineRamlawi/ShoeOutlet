"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import useWindowWidth from "@/hooks/useWindowWidth";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import Image from "next/image";
import "./home.css";
import ProductCard from "@/components/ProductCard";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CategorySidebar from "@/components/CategorySidebar";
import { Product } from "@/types/product";

export default function Home() {
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState<
    Record<string, Set<string>>
  >({});
  const [fadeTransition, setFadeTransition] = useState(false);
  const [randomIndex, setRandomIndex] = useState(0);
  const [loadingRandom, setLoadingRandom] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const screenWidth = useWindowWidth();
  const productCount = screenWidth < 1000 ? 2 : screenWidth < 1335 ? 3 : 4;

  const randomPlaceholders = Array.from({ length: productCount }, (_, i) => (
    <div
      key={`random-placeholder-${i}`}
      className="product-card placeholder-box"
    />
  ));

  const recentPlaceholders = Array.from({ length: 12 }, (_, i) => (
    <div
      key={`recent-placeholder-${i}`}
      className="product-card placeholder-box"
    />
  ));

  useEffect(() => {
    const fetchLimitedProducts = async () => {
      setLoadingRandom(true);
      try {
        const randomQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "asc"),
          limit(30)
        );
        const querySnapshot = await getDocs(randomQuery);

        if (querySnapshot.empty) {
          setFetchError(true);
          return;
        }

        const allProducts: Product[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));

        const offers = allProducts.filter((p) => !!p.offerPrice);
        setOfferProducts(offers);

        const shuffled = allProducts
          .sort(() => Math.random() - 0.5)
          .slice(0, 20);
        setRandomProducts(shuffled);

        const genderMap: Record<string, Set<string>> = {};
        for (const p of shuffled) {
          if (!genderMap[p.gender]) genderMap[p.gender] = new Set();
          p.categories?.forEach((cat) => genderMap[p.gender].add(cat));
        }
        setCategoriesMap(genderMap);
      } catch (err) {
        console.error("Fetch random failed", err);
        setFetchError(true);
      } finally {
        setLoadingRandom(false);
      }
    };

    const fetchRecent = async () => {
      setLoadingRecent(true);
      try {
        const recentQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(12)
        );
        const snapshot = await getDocs(recentQuery);

        if (snapshot.empty) {
          setFetchError(true);
          return;
        }

        const items: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));

        setRecentProducts(items);
      } catch (err) {
        console.error("Fetch recent failed", err);
        setFetchError(true);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchLimitedProducts();
    fetchRecent();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeTransition(true);
      setTimeout(() => {
        setRandomIndex(
          (prev) => (prev + productCount) % Math.max(randomProducts.length, 1)
        );
        setFadeTransition(false);
      }, 500);
    }, 20000);

    return () => clearInterval(interval);
  }, [randomProducts, productCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);

  const visibleProducts = randomProducts.slice(
    randomIndex,
    randomIndex + productCount
  );

  return (
    <main className="homepage-container">
      <div className="poster">
        <NavBar />
        <CategorySidebar
          show={showCategories}
          categoriesMap={categoriesMap}
          onToggle={() => setShowCategories(!showCategories)}
        />
      </div>

      <div className="products-container">
        <h2 className="section-title">Random Selection</h2>
        {fetchError ? (
          <p className="error-message">
            ⚠️ Connection error. Please refresh the page.
          </p>
        ) : (
          <div
            className={`product-grid fade-wrapper ${
              fadeTransition ? "fade-out" : "fade-in"
            }`}
          >
            {loadingRandom
              ? randomPlaceholders
              : visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        )}

        <div className="section-divider" />

        {offerProducts.length > 0 && !fetchError && (
          <>
            <h2 className="section-title">Special Offers</h2>
            <div className="product-grid">
              {offerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        <div className="section-divider" />

        <h2 className="section-title">Recent Products</h2>
        {fetchError ? (
          <p className="error-message">
            ⚠️ Connection error. Please refresh the page.
          </p>
        ) : (
          <div className="product-grid">
            {loadingRecent
              ? recentPlaceholders
              : recentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        )}
      </div>

      <div className="shoe-ad-container">
        <div className="shoe-ad-image">
          <Image
            src="/images/posters/shoe_poster.png"
            alt="Shoe Poster"
            width={320}
            height={320}
          />
        </div>
        <div className="shoe-ad-content">
          <h1>
            <span>Free</span> Delivery All Over Lebanon
          </h1>
        </div>
      </div>

      <Footer />
    </main>
  );
}
