"use client";
import React, { useEffect, useState, useCallback } from "react";
import "./ProductCard.css";
import Image from "next/image";
import { ProductCardWithSizeProps } from "@/types/product";

const parseSizeRange = (range: string): string[] => {
  if (range.toLowerCase() === "custom") return ["Custom"];

  const [min, max] = range.split("-").map(Number);
  if (isNaN(min) || isNaN(max) || min > max) return [];

  const sizes: string[] = [];
  for (let size = min; size <= max; size++) {
    sizes.push(size.toString());
  }
  return sizes;
};

const ProductCardWithSize: React.FC<ProductCardWithSizeProps> = ({
  product,
  onSizeChange,
  onQuantityChange,
  initialQuantity = 1,
  initialSizes = [],
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSizes);

  const sizeOptions = parseSizeRange(product.size);

  const syncState = useCallback(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setIsFavorite(favorites.includes(product.id));
    setInCart(cart.includes(product.id));
  }, [product.id]);

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
  }, [syncState]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updated = favorites.includes(product.id)
      ? favorites.filter((id: string) => id !== product.id)
      : [...favorites, product.id];

    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFavorite(updated.includes(product.id));
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const handleSizeChange = (index: number, value: string) => {
    const newSizes = [...selectedSizes];
    newSizes[index] = value;
    setSelectedSizes(newSizes);
    if (onSizeChange) {
      onSizeChange(product.id, newSizes);
    }
  };

  const toggleCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartSizes = JSON.parse(localStorage.getItem("cartSizes") || "{}");
    const cartQuantities = JSON.parse(
      localStorage.getItem("cartQuantities") || "{}"
    );

    if (inCart) {
      const updatedCart = cart.filter((id: string) => id !== product.id);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      delete cartSizes[product.id];
      localStorage.setItem("cartSizes", JSON.stringify(cartSizes));

      delete cartQuantities[product.id];
      localStorage.setItem("cartQuantities", JSON.stringify(cartQuantities));
    } else {
      const updatedCart = [...cart, product.id];
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      cartSizes[product.id] = selectedSizes;
      localStorage.setItem("cartSizes", JSON.stringify(cartSizes));

      cartQuantities[product.id] = quantity;
      localStorage.setItem("cartQuantities", JSON.stringify(cartQuantities));
    }

    setInCart(!inCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="product-card-with-size">
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

      <Image
        src={product.imageUrl}
        alt={product.name}
        className="product-img"
        height={1024}
        width={1024}
        unoptimized
      />
      <div className="quantity-container">
        <div className="quantity-controls">
          <label htmlFor={`quantity-${product.id}`} className="quantity-label">
            Quantity
          </label>
          <div className="quantity-selector">
            <button
              className="quantity-button minus"
              onClick={() => {
                const newQuantity = Math.max(1, quantity - 1);
                setQuantity(newQuantity);
                if (onQuantityChange) onQuantityChange(product.id, newQuantity);
              }}
              aria-label="Decrease quantity"
            >
              <svg
                width="12"
                height="2"
                viewBox="0 0 12 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1H11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <input
              id={`quantity-${product.id}`}
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value) || 1;
                setQuantity(newQuantity);
                if (onQuantityChange) onQuantityChange(product.id, newQuantity);
              }}
              className="quantity-input no-spinners"
              aria-label="Quantity"
            />

            <button
              className="quantity-button plus"
              onClick={() => {
                const newQuantity = quantity + 1;
                setQuantity(newQuantity);
                if (onQuantityChange) onQuantityChange(product.id, newQuantity);
              }}
              aria-label="Increase quantity"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 6H11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 1V11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
        {quantity === 1 ? (
          <select
            value={selectedSizes[0] || ""}
            onChange={(e) => handleSizeChange(0, e.target.value)}
            className="size-select"
          >
            <option value="" disabled>
              Choose Size
            </option>
            {sizeOptions.length > 0 ? (
              sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))
            ) : (
              <option disabled>No sizes available</option>
            )}
          </select>
        ) : (
          <div className="multiple-sizes">
            {Array.from({ length: quantity }).map((_, index) => (
              <select
                key={index}
                value={selectedSizes[index] || ""}
                onChange={(e) => handleSizeChange(index, e.target.value)}
                className="size-select"
              >
                <option value="" disabled>
                  {selectedSizes[index]
                    ? `Size ${index + 1}: ${selectedSizes[index]}`
                    : `Choose size #${index + 1}`}
                </option>
                {sizeOptions.length > 0 ? (
                  sizeOptions.map((size) => (
                    <option key={`${size}-${index}`} value={size}>
                      {size}
                    </option>
                  ))
                ) : (
                  <option disabled>No sizes available</option>
                )}
              </select>
            ))}
          </div>
        )}
      </div>

      <div className="overlay-bottom-size">
        <div className="price-one">
          <div className="price">
            {product.offerPrice ? (
              <>
                <span className="original-price">${product.price}</span>
                <span className="offer-price">
                  ${product.offerPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="regular-price">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button
            className={`add-to-cart ${inCart ? "in-cart" : ""}`}
            onClick={toggleCart}
          >
            <span className="material-symbols-outlined">
              {inCart ? "remove_shopping_cart" : "add_shopping_cart"}
            </span>
            {inCart ? "Remove" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardWithSize;
