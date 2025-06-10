"use client";

import "@/app/admin/admin.css";
import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { genderCategoriesMap } from "@/config/genderCategories";
import { uploadImageToImgBB } from "@/lib/uploadImageToImgBB";
import Image from "next/image";
import { Product, EditForm } from "@/types/product";

export default function EditProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    size: "",
    price: "",
    offerPrice: "",
    gender: "",
    categories: [],
    imageUrl: "",
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/admin/verify");
        if (!res.ok) throw new Error("Unauthorized");
      } catch {
        router.push("/admin/login");
      }
    };
    verifyAuth();
  }, [router]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsRef = collection(db, "products");
      const orderedQuery = query(productsRef, orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(orderedQuery);

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(items);
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      ...product,
      price: product.price.toString(),
      offerPrice: product.offerPrice?.toString() || "",
    });
    setNewImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      size: "",
      price: "",
      offerPrice: "",
      gender: "",
      categories: [],
      imageUrl: "",
    });
    setNewImageFile(null);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const gender = e.target.value;
    setEditForm((prev) => ({
      ...prev,
      gender,
      categories: [],
    }));
  };

  const handleCategoryChange = (cat: string) => {
    setEditForm((prev) => {
      const categories = prev.categories || [];
      return {
        ...prev,
        categories: categories.includes(cat)
          ? categories.filter((c) => c !== cat)
          : [...categories, cat],
      };
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setIsSaving(true);
    try {
      let updatedImageUrl = editForm.imageUrl;

      if (newImageFile) {
        try {
          updatedImageUrl = await uploadImageToImgBB(newImageFile);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Image upload failed";
          alert(message);
          return;
        }
      }

      const updateData: Partial<Product> = {
        name: editForm.name,
        size: editForm.size,
        price:
          typeof editForm.price === "string"
            ? parseFloat(editForm.price)
            : editForm.price,
        gender: editForm.gender,
        categories: editForm.categories,
        imageUrl: updatedImageUrl,
      };

      updateData.offerPrice =
        editForm.offerPrice !== ""
          ? parseFloat(editForm.offerPrice as string)
          : undefined;

      await updateDoc(doc(db, "products", editingId), updateData);

      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...updateData,
              }
            : item
        )
      );

      alert("Product updated successfully!");
      cancelEdit();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Update failed";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const makeNewest = async (id: string) => {
    const confirmUpdate = window.confirm(
      "Are you sure you want to update the product timestamp to make it the newest?"
    );

    if (!confirmUpdate) return;

    try {
      await updateDoc(doc(db, "products", id), {
        createdAt: serverTimestamp(),
      });
      alert("Product timestamp updated to newest.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update timestamp";
      alert(message);
    }
  };

  return (
    <main className="admin-container">
      <h1 className="admin-title">🛠 Edit Products</h1>
      <div className="edit-list">
        {products.map((product) =>
          editingId === product.id ? (
            <div key={product.id} className="edit-card">
              <Image
                className="edit-card-image"
                src={
                  newImageFile
                    ? URL.createObjectURL(newImageFile)
                    : editForm.imageUrl
                }
                alt="Preview"
                width={1024}
                height={1024}
                style={{ marginBottom: "10px", objectFit: "contain" }}
                unoptimized
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                className="edit-input"
              />
              <input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="edit-input"
                placeholder="Product Name"
              />
              <input
                name="size"
                value={editForm.size}
                onChange={handleEditChange}
                className="edit-input"
                placeholder="Size"
              />
              <input
                name="price"
                type="number"
                value={editForm.price}
                onChange={handleEditChange}
                className="edit-input"
                placeholder="Price"
              />
              <input
                name="offerPrice"
                type="number"
                value={editForm.offerPrice}
                onChange={handleEditChange}
                className="edit-input"
                placeholder="Offer Price (optional)"
              />

              <select
                name="gender"
                value={editForm.gender || ""}
                onChange={handleGenderChange}
                className="edit-input"
              >
                <option value="">Select Gender</option>
                {Object.keys(genderCategoriesMap).map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>

              <div className="checkbox-group">
                {(genderCategoriesMap[editForm.gender] || []).map((cat) => (
                  <label key={cat} className="checkbox-label-edit">
                    <input
                      type="checkbox"
                      checked={editForm.categories?.includes(cat) || false}
                      onChange={() => handleCategoryChange(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>

              <div className="product-actions">
                <button
                  onClick={saveEdit}
                  className="edit-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button onClick={cancelEdit} className="edit-button">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={product.id} className="edit-card">
              <Image
                className="edit-card-image"
                src={product.imageUrl}
                alt={product.name}
                width={1024}
                height={1024}
                unoptimized
              />
              <div>
                <p>
                  <strong>{product.name}</strong>
                </p>
                <p>Size: {product.size}</p>
                <p>Price: ${product.price}</p>
                {product.offerPrice !== undefined && (
                  <p style={{ color: "green" }}>
                    Offer Price: ${product.offerPrice}
                  </p>
                )}

                <p>Gender: {product.gender}</p>
                <p>Categories: {product.categories?.join(", ")}</p>
              </div>
              <div className="product-actions">
                <button
                  onClick={() => startEdit(product)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="edit-button"
                  style={{ backgroundColor: "red" }}
                >
                  Delete
                </button>
                <button
                  onClick={() => makeNewest(product.id)}
                  className="edit-button"
                  style={{ backgroundColor: "green" }}
                >
                  Make Newest
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}
