import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function CategoryPage() {
  const { gender, category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const items = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (p: any) => p.gender === gender && p.category === category
        );
      setProducts(items);
    };
    fetch();
  }, [gender, category]);

  return (
    <div>
      <h2>{gender} - {category}</h2>
      {/* render your products here */}
    </div>
  );
}
