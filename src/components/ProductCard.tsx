"use client";
import React, { useEffect, useState } from "react";
import "./ProductCard.css";

type Product = {
  id: string;
  name: string;
  size: string;
  price: number;
  description?: string;
  imageUrl: string;
  gender?: string;
  categories?: string[];
};

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);

  // Sync with localStorage on load and when updated
  const syncState = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setIsFavorite(favorites.includes(product.id));
    setInCart(cart.includes(product.id));
  };

  useEffect(() => {
    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener("favoritesUpdated", syncState);
    window.addEventListener("cartUpdated", syncState);
    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("favoritesUpdated", syncState);
      window.removeEventListener("cartUpdated", syncState);
    };
  }, []);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updated = favorites.includes(product.id)
      ? favorites.filter((id: string) => id !== product.id)
      : [...favorites, product.id];

    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFavorite(updated.includes(product.id));
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const toggleCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updated = cart.includes(product.id)
      ? cart.filter((id: string) => id !== product.id)
      : [...cart, product.id];

    localStorage.setItem("cart", JSON.stringify(updated));
    setInCart(updated.includes(product.id));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="product-card">
      <div className="overlay-top">
        <div className="product-info">
          <span className="product-name">{product.name}</span>
          <span className="product-size">{product.size}</span>
        </div>
        <button className="icon-button heart" onClick={toggleFavorite}>
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings: `'FILL' ${isFavorite ? 1 : 0}`,
              color: isFavorite ? "red" : "gray",
            }}
          >
            favorite
          </span>
        </button>
      </div>

      <img src={product.imageUrl} alt={product.name} className="product-img" />

      <div className="overlay-bottom">
        <span className="price">${product.price.toFixed(2)}</span>
        <button
          className={`add-to-cart ${inCart ? "in-cart" : ""}`}
          onClick={toggleCart}
        >
          <span className="material-symbols-outlined">
            {inCart ? "remove_shopping_cart" : "add_shopping_cart"}
          </span>
          {inCart ? "Remove from Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
