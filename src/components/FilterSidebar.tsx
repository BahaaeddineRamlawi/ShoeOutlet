"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import "./FilterSidebar.css";
import { Product } from "@/types/product";

type SidebarProps = {
  visible: boolean;
};

export default function FilterSidebar({ visible }: SidebarProps) {
  const [genders, setGenders] = useState<string[]>([]);
  const [categories, setCategories] = useState<Record<string, Set<string>>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "products"));

      const products: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));

      const genderMap: Record<string, Set<string>> = {};

      for (const product of products) {
        const gender = product.gender;
        const cats: string[] = product.categories || [];

        if (!genderMap[gender]) {
          genderMap[gender] = new Set();
        }
        cats.forEach((c) => genderMap[gender].add(c));
      }

      setGenders(Object.keys(genderMap));
      setCategories(genderMap);
    };

    fetchData();
  }, []);

  const goToCategory = (gender: string, category: string) => {
    router.push(
      `/shop/${encodeURIComponent(gender)}/${encodeURIComponent(category)}`
    );
  };

  return (
    <aside className={`sidebar ${visible ? "visible" : ""}`}>
      <h3>Filter by Gender & Category</h3>
      <ul>
        {genders.map((gender) => (
          <li key={gender}>
            <details>
              <summary>{gender}</summary>
              <ul className="category-list">
                {[...(categories[gender] || [])].map((cat) => (
                  <li key={cat}>
                    <button onClick={() => goToCategory(gender, cat)}>
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </aside>
  );
}
