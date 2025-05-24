"use client";

import "@/app/admin/admin.css";
import { useState } from "react";
import { uploadImageToImgBB } from "@/lib/uploadImageToImgBB";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { genderCategoriesMap } from "@/config/genderCategories";

const genders = Object.keys(genderCategoriesMap);

export default function AdminPage() {
  const [form, setForm] = useState({
    name: "",
    size: "",
    price: "",
    gender: "Unisex",
    categories: [] as string[],
    image: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customSizeMode, setCustomSizeMode] = useState(false);

  const categoriesList = genderCategoriesMap[form.gender] || [];
  const predefinedSizes = [
    "21-25",
    "26-30",
    "31-36",
    "36-41",
    "41-45",
    "45-49",
  ];

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    if (name === "gender") {
      setForm((prev) => ({
        ...prev,
        gender: value,
        categories: [],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCategoryChange = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.size ||
      !form.price ||
      !form.image ||
      !form.gender ||
      form.categories.length === 0
    ) {
      return alert("Please fill in all required fields.");
    }

    try {
      const imageUrl = await uploadImageToImgBB(form.image);

      const newShoe = {
        name: form.name,
        size: form.size,
        price: parseFloat(form.price),
        gender: form.gender,
        categories: form.categories,
        imageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "products"), newShoe);
      alert("Shoe added!");

      setForm({
        name: "",
        size: "",
        price: "",
        gender: "Unisex",
        categories: [],
        image: null,
      });
      setPreviewUrl(null);
      setCustomSizeMode(false);
    } catch (error: any) {
      alert("Image upload failed: " + error.message);
    }
  };

  return (
    <main className="admin-container">
      <h1 className="admin-title">Add New Shoe</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleInput}
            required
            className="input"
          />

          <div className="size-selector">
            {!customSizeMode ? (
              <>
                <p>Select Size Range:</p>
                <div className="size-buttons">
                  {predefinedSizes.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setForm({ ...form, size: range })}
                      className={`size-button ${
                        form.size === range ? "selected" : ""
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSizeMode(true);
                      setForm({ ...form, size: "" });
                    }}
                    className="size-button"
                  >
                    Custom
                  </button>
                </div>
              </>
            ) : (
              <div className="custom-size-input">
                <input
                  name="size"
                  placeholder="Enter size (e.g., 42)"
                  value={form.size}
                  onChange={handleInput}
                  required
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setCustomSizeMode(false)}
                  className="size-button"
                >
                  Back to Ranges
                </button>
              </div>
            )}
          </div>
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={handleInput}
            required
            className="input"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleInput}
            className="select"
          >
            {genders.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>

          <div className="checkbox-group">
            {categoriesList.map((cat) => (
              <label key={cat} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.categories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          <div className="add-buttons">
            <label className="custom-file-upload button">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              Upload Image
            </label>

            <button type="submit" className="button">
              Add Shoe
            </button>
          </div>
        </div>

        <div className="image-preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" />
          ) : (
            <p>No image selected</p>
          )}
        </div>
      </form>
    </main>
  );
}
