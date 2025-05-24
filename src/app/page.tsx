"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { useRouter } from "next/navigation";
import "./home.css";
import ProductCard from "@/components/ProductCard";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

type Product = {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  imageUrl: string;
  gender: string;
  categories?: string[];
  timestamp?: { seconds: number };
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [brandResults, setBrandResults] = useState<Product[] | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState<
    Record<string, Set<string>>
  >({});
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const allItems: Product[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));

      // Set products + top 4 random
      const shuffled = shuffleArray(allItems);
      setProducts(allItems);
      setFilteredProducts(shuffled.slice(0, 4));

      // ✅ Fetch most recent 8 products from Firestore
      const recentQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(12)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recentItems: Product[] = recentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));
      setRecentProducts(recentItems);

      // Favorites & cart from localStorage
      const allProductIds = allItems.map((p) => p.id);
      const savedFavorites: string[] = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );
      const savedCart: string[] = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );
      const validFavorites = savedFavorites.filter((id) =>
        allProductIds.includes(id)
      );
      const validCart = savedCart.filter((id) => allProductIds.includes(id));
      setFavorites(validFavorites);
      setCart(validCart);
      localStorage.setItem("favorites", JSON.stringify(validFavorites));
      localStorage.setItem("cart", JSON.stringify(validCart));

      // Generate category map
      const genderMap: Record<string, Set<string>> = {};
      for (const p of allItems) {
        if (!genderMap[p.gender]) genderMap[p.gender] = new Set();
        p.categories?.forEach((cat) => genderMap[p.gender].add(cat));
      }
      setCategoriesMap(genderMap);
    };

    fetchProducts();
  }, []);

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

  const shuffleArray = (array: Product[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const goToCategory = (gender: string, category: string) => {
    router.push(`/shop/${gender}/${category}`);
  };

  const brandRef = useRef<HTMLDivElement>(null);

  const handleBrandClick = (brand: string) => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(brand.toLowerCase())
    );
    setBrandResults(filtered);
    setSearchTerm(brand);
    setShowSearch(true);

    setTimeout(() => {
      if (brandRef.current) {
        const yOffset = -40; // change this value as needed
        const y =
          brandRef.current.getBoundingClientRect().top +
          window.scrollY +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <main className="homepage-container">
      <div className="poster">
        <div className="nav-background">
          <NavBar />
        </div>

        {showCategories && (
          <div className="collection-popup">
            <div className="collection-content">
              <button
                className="close-button"
                onClick={() => setShowCategories(false)}
              >
                ×
              </button>
              <h3>Categories</h3>
              {Object.entries(categoriesMap).map(([gender, cats]) => (
                <div key={gender}>
                  <strong>{gender}</strong>
                  <ul>
                    {[...cats].map((cat) => (
                      <li key={cat}>
                        <button onClick={() => goToCategory(gender, cat)}>
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="products-container">
        {/* Random 4 products */}
        <h2 className="section-title">Random Selection</h2>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Featured Brands */}
        <h2 className="section-title">Featured Brands</h2>
        <div className="brands-row">
          {[
            "Nike",
            "Adidas",
            "Reebok",
            "NewBalance",
            "Jordan",
            "Skechers",
            "Hoka",
            "Asics",
            "Fendi",
          ].map((brand) => (
            <img
              key={brand}
              src={`/images/brands/${brand}.png`}
              alt={brand}
              className="brand-logo"
              onClick={() => handleBrandClick(brand)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>

        {/* Brand search results */}
        <div
          ref={brandRef}
          className={`brand-results-section ${brandResults ? "show" : ""}`}
        >
          {brandResults && (
            <div
              className={`brand-results-section ${brandResults ? "show" : ""}`}
            >
              <h2 className="section-title">
                {searchTerm.includes("shoe")
                  ? searchTerm
                  : `${searchTerm} Shoes`}
              </h2>
              {brandResults.length > 0 ? (
                <div className="product-grid">
                  {brandResults.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p>
                  Sorry, we don't have any <strong>{searchTerm}</strong> shoes
                  in stock right now.
                </p>
              )}
              <button
                className="button-filter"
                onClick={() => {
                  setBrandResults(null);
                  setSearchTerm("");
                }}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Recent products */}
        <h2 className="section-title">Recent Products</h2>
        <div className="product-grid">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      <div className="shoe-ad-container">
        {" "}
        <div className="shoe-ad-image">
          {" "}
          <img src="/images/shoe_poster.png" alt="Shoe Poster" />{" "}
        </div>
        <div className="shoe-ad-content">
          {" "}
          <h1>
            <span>Free</span> Delivery All Over Lebanon
          </h1>
        </div>
      </div>
      <Footer />
    </main>
  );
}
