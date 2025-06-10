import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-simple-content">
        <p>
          &copy; {new Date().getFullYear()} ShoeOutlet. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="/info#payment">Payment</a>
          <a href="/info#how-to-order">How to Order</a>
          <a href="/info#contact">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
