"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ProductCardWithSize from "@/components/ProductCardWithSize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";
import "./cart.css";
import { Product, CartItem, CartProductWithSize } from "@/types/product";

const parseSizeRange = (range: string): string[] => {
  if (!range) return [];
  if (range.toLowerCase() === "custom") return ["Custom"];

  const [min, max] = range.split("-").map(Number);
  if (isNaN(min) || isNaN(max) || min > max) return [];

  const sizes: string[] = [];
  for (let i = min; i <= max; i++) {
    sizes.push(i.toString());
  }
  return sizes;
};

export default function ShoppingCartPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [, setCartItems] = useState<CartItem[]>([]);
  const [cartProducts, setCartProducts] = useState<CartProductWithSize[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<"wish" | "cod">("cod");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const newTotal = cartProducts.reduce((sum, product) => {
      const priceToUse = product.offerPrice ?? product.price;
      return sum + priceToUse * product.quantity;
    }, 0);
    setTotalPrice(newTotal);
  }, [cartProducts]);

  useEffect(() => {
    const fetchData = async (showSpinner: boolean = false) => {
      try {
        if (showSpinner) setIsLoading(true);

        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const savedQuantities = JSON.parse(
          localStorage.getItem("cartQuantities") || "{}"
        );
        const savedSizes = JSON.parse(
          localStorage.getItem("cartSizes") || "{}"
        );

        const cartItemsWithDetails: CartItem[] = savedCart.map(
          (id: string) => ({
            id,
            quantity: savedQuantities[id] || 1,
            sizes: savedSizes[id] || [
              parseSizeRange(
                allProducts.find((p) => p.id === id)?.size || ""
              )[0] || "",
            ],
          })
        );

        setCartItems(cartItemsWithDetails);

        const querySnapshot = await getDocs(collection(db, "products"));
        const products: Product[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));
        setAllProducts(products);

        const productMap = new Map<
          string,
          { quantity: number; sizes: string[] }
        >();
        cartItemsWithDetails.forEach((item: CartItem) => {
          if (productMap.has(item.id)) {
            const existing = productMap.get(item.id)!;
            productMap.set(item.id, {
              quantity: existing.quantity + item.quantity,
              sizes: [...existing.sizes, ...item.sizes],
            });
          } else {
            productMap.set(item.id, {
              quantity: item.quantity,
              sizes: item.sizes,
            });
          }
        });

        const matched = products.filter((p) => productMap.has(p.id));
        const cartWithDetails = matched.map((product) => {
          const item = productMap.get(product.id)!;
          return {
            ...product,
            quantity: item.quantity,
            selectedSizes: item.sizes,
          };
        });

        setCartProducts(cartWithDetails);
      } catch {
      } finally {
        if (showSpinner) setIsLoading(false);
      }
    };

    fetchData(true);

    const handleUpdate = () => fetchData(false);
    window.addEventListener("cartUpdated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (
        e.key === "cart" ||
        e.key === "cartQuantities" ||
        e.key === "cartSizes"
      ) {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [allProducts]);

  const handleSizeChange = (productId: string, sizes: string[]) => {
    setCartProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, selectedSizes: sizes } : p))
    );

    const cartSizes = JSON.parse(localStorage.getItem("cartSizes") || "{}");
    cartSizes[productId] = sizes;
    localStorage.setItem("cartSizes", JSON.stringify(cartSizes));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCartProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity } : p))
    );

    const cartQuantities = JSON.parse(
      localStorage.getItem("cartQuantities") || "{}"
    );
    cartQuantities[productId] = quantity;
    localStorage.setItem("cartQuantities", JSON.stringify(cartQuantities));
  };

  const validateCheckout = (): boolean => {
    const invalidProducts = cartProducts.filter((product) => {
      return product.selectedSizes.some((size) => !size || size === "");
    });

    if (invalidProducts.length > 0) {
      setCheckoutError("Please select sizes for all items before checkout");
      return false;
    }

    setCheckoutError(null);
    return true;
  };

  const generateOrderMessage = () => {
    const lines = cartProducts.flatMap((p, productIndex) => {
      return p.selectedSizes.map((size, sizeIndex) => {
        const itemNumber = productIndex + sizeIndex + 1;
        return `#${itemNumber}: ${
          p.name
        }\n• Size: ${size}\n• Price: $${p.price.toFixed(2)}\n• Image: ${
          p.imageUrl
        }`;
      });
    });

    const paymentDetails = `\nPayment Method: ${
      paymentMethod === "wish" ? "Wish Money" : "Cash on Delivery"
    }`;

    const totalDetails = `\nTotal Amount: $${totalPrice.toFixed(2)}`;

    return `*ORDER RECEIPT*\n\n${lines.join(
      "\n\n"
    )}${paymentDetails}${totalDetails}\n\nThank you for your order!\n\nWe'll contact you shortly to confirm your order details.`;
  };

  const handleCheckout = (platform: "whatsapp" | "instagram") => {
    if (!validateCheckout()) {
      return;
    }

    const message = generateOrderMessage();
    const encodedMessage = encodeURIComponent(message);

    if (platform === "whatsapp") {
      const whatsappURL = `https://wa.me/96178817895?text=${encodedMessage}`;
      window.open(whatsappURL, "_blank");
    } else {
      const instagramURL = `https://www.instagram.com/direct/t/17842013582474311/?text=${encodedMessage}`;
      window.open(instagramURL, "_blank");
    }
  };

  return (
    <main className="shoppingcart-page">
      <NavBar />
      <div className="shoppingcart-products">
        <h2 className="section-title">Your Shopping Cart</h2>
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your cart...</p>
          </div>
        ) : cartProducts.length > 0 ? (
          <>
            {checkoutError && (
              <div className="checkout-error">{checkoutError}</div>
            )}
            <div className="product-grid">
              {cartProducts.map((product) => (
                <ProductCardWithSize
                  key={`${product.id}-${product.quantity}`}
                  product={product}
                  onSizeChange={handleSizeChange}
                  onQuantityChange={handleQuantityChange}
                  initialQuantity={product.quantity}
                  initialSizes={product.selectedSizes}
                />
              ))}
            </div>

            <div className="cart-summary">
              <h3>Total: ${totalPrice.toFixed(2)}</h3>
              <div className="payment-methods">
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  Cash on Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="wish"
                    checked={paymentMethod === "wish"}
                    onChange={() => setPaymentMethod("wish")}
                  />
                  Wish Money
                </label>
              </div>
              <div className="checkout-buttons">
                <button
                  className="checkout-button whatsapp"
                  onClick={() => handleCheckout("whatsapp")}
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="fa-icon" />{" "}
                  Checkout with WhatsApp
                </button>
                <button
                  className="checkout-button instagram"
                  onClick={() => handleCheckout("instagram")}
                >
                  <FontAwesomeIcon icon={faInstagram} className="fa-icon" />{" "}
                  Checkout with Instagram
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="empty-cart-message">Your cart is empty.</p>
        )}
      </div>
      <Footer />
    </main>
  );
}
