import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Product } from "@/types/product";

const genderAliases: Record<string, string> = {
  men: "men",
  man: "men",
  male: "men",
  women: "women",
  woman: "women",
  female: "women",
  kid: "kids",
  child: "kids",
  children: "kids",
  boys: "kids",
  girls: "kids",
};

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const normalizedTerm = searchTerm.toLowerCase().trim();
  const normalizedGender = genderAliases[normalizedTerm];

  const snapshot = await getDocs(collection(db, "products"));
  const allProducts: Product[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Product, "id">),
  }));

  return allProducts.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(normalizedTerm);
    const categoryMatch = p.categories?.some((cat) =>
      cat.toLowerCase().includes(normalizedTerm)
    );
    const genderMatch = normalizedGender && p.gender === normalizedGender;

    return nameMatch || categoryMatch || genderMatch;
  });
}
