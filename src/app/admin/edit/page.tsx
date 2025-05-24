"use client";
import "@/app/admin/admin.css";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

export default function EditProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const productsRef = collection(db, "products");
      const orderedQuery = query(productsRef, orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(orderedQuery);

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(items);
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      await updateDoc(doc(db, "products", editingId), {
        name: editForm.name,
        size: editForm.size,
        price: parseFloat(editForm.price),
        gender: editForm.gender,
        categories: editForm.categories,
      });

      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...editForm } : item
        )
      );

      setEditingId(null);
      setEditForm({});
      alert("Product updated successfully.");
    } catch (err) {
      alert("Update failed.");
      console.error(err);
    }
  };

  return (
    <main className="admin-container">
      <h1 className="admin-title">Edit Products</h1>
      <div className="edit-list">
        {products.map((product) =>
          editingId === product.id ? (
            <div key={product.id} className="edit-card">
              <img
                id="product-image"
                src={editForm.imageUrl}
                alt={editForm.name}
                width={100}
                style={{ marginBottom: "10px" }}
              />
              <div>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="edit-input"
                />
                <input
                  name="size"
                  value={editForm.size}
                  onChange={handleEditChange}
                  className="edit-input"
                />
                <input
                  name="price"
                  type="number"
                  value={editForm.price}
                  onChange={handleEditChange}
                  className="edit-input"
                />
                <input
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                  className="edit-input"
                />
                <input
                  name="categories"
                  value={editForm.categories}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      categories: e.target.value
                        .split(",")
                        .map((c) => c.trim()),
                    })
                  }
                  className="edit-input"
                  placeholder="Comma-separated (e.g., Sport, Casual)"
                />
              </div>
              <div className="product-actions">
                <button onClick={saveEdit} className="edit-button">
                  Save
                </button>
                <button onClick={cancelEdit} className="edit-button">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={product.id} className="edit-card">
              <img
                id="product-image"
                src={product.imageUrl}
                alt={product.name}
                width={100}
              />
              <div>
                <p id="edit-product-title">
                  <strong style={{ fontSize: "18px" }}>{product.name}</strong>
                </p>
                <p>Size: {product.size}</p>
                <p>Price: ${product.price}</p>
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
                  id="delete-button"
                  style={{ backgroundColor: "red" }}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}
