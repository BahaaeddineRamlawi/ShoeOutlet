"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";

import "./info.css";

type Section = "payment" | "contact" | "how-to-order";

export default function InfoPage() {
  const [activeSection, setActiveSection] = useState<Section>("payment");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "payment" || hash === "contact" || hash === "how-to-order") {
      setActiveSection(hash as Section);
    }
  }, []);

  return (
    <main className="info-page">
      <div className="nav-background">
        <NavBar />
      </div>
      <div className="info-content">
        {activeSection === "payment" && (
          <section className="info-section">
            <h2 className="icon-title">
              <span className="material-symbols-outlined title">
                credit_card
              </span>
              Payment Methods
            </h2>
            <ul>
              <li>
                <div className="flex-row">
                  <strong className="icon-label">
                    <span className="material-symbols-outlined with-margin">
                      payments
                    </span>
                    Cash on Delivery
                  </strong>
                  – Pay for your order when it arrives at your doorstep. Safe
                  and simple!
                </div>
              </li>
              <li>
                <div className="flex-row">
                  <strong className="icon-label">
                    <span className="material-symbols-outlined with-margin">
                      wallet
                    </span>
                    Wish Money
                  </strong>
                  – Transfer to the following account:
                </div>
                <code>wish-account@payments.com</code>
              </li>
            </ul>
            <div className="flex-row">
              <strong className="icon-label">
                <span className="material-symbols-outlined with-margin">
                  local_shipping
                </span>
                Delivery is free
              </strong>{" "}
              to all Lebanese ground!
            </div>
          </section>
        )}

        {activeSection === "contact" && (
          <section className="info-section">
            <h2 className="icon-title">
              <span className="material-symbols-outlined title">mail</span>
              Contact Us
            </h2>
            <ul>
              <li>
                <strong className="icon-label">
                  <FontAwesomeIcon icon={faInstagram} className="fa-icon" />{" "}
                  Instagram:
                </strong>
                <a
                  href="https://instagram.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @yourusername
                </a>
              </li>
              <li>
                <strong className="icon-label">
                  <FontAwesomeIcon icon={faWhatsapp} className="fa-icon" />{" "}
                  WhatsApp:
                </strong>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +123 456 7890
                </a>
              </li>
            </ul>
          </section>
        )}

        {activeSection === "how-to-order" && (
          <section className="info-section">
            <h2 className="icon-title">
              <span className="material-symbols-outlined title">package_2</span>
              How to Order
            </h2>
            <ul>
              <li>Add items to your cart.</li>
              <li>Go to your cart.</li>
              <li>
                Click <strong>"Proceed to Checkout"</strong>.
              </li>
              <li>
                You’ll be redirected to Instagram or WhatsApp with a message
                like:
                <br />
                <code>
                  Hello, I would like to place an order from your website.
                </code>
              </li>
            </ul>
            <div className="flex-row">
              <strong className="icon-label">
                <span className="material-symbols-outlined with-margin">
                  local_shipping
                </span>
                Delivery is free
              </strong>{" "}
              to all Lebanese ground!
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
