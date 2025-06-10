"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import NavBar from "@/components/NavBar";
import "./shop.css";
import { Product } from "@/types/product";

export default function CategoryPage() {
  const params = useParams();
  const gender = decodeURIComponent(params.gender as string);
  const category = decodeURIComponent(params.category as string);

  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const items: Product[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }))
        .filter((p) => p.gender === gender && p.categories?.includes(category))
        .sort((a, b) => a.name.localeCompare(b.name));

      setProducts(items);
    };
    fetch();
  }, [gender, category]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div>
      <div className="poster">
        <NavBar />
      </div>
      <div className="products-container">
        <h2 className="section-title">
          {gender} - {category}
        </h2>
        <div className="product-grid">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {visibleCount < products.length && (
          <div className="button-container">
            <button onClick={handleShowMore} className="show-more-button">
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
