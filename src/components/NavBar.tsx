"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./NavBar.css";

const NavBar = () => {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => setIsLargeScreen(window.innerWidth > 600);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const updateFavoritesCount = () => {
      const storedFavorites: string[] = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );
      setFavoritesCount(storedFavorites.length);
    };

    updateFavoritesCount();
    window.addEventListener("favoritesUpdated", updateFavoritesCount);
    return () =>
      window.removeEventListener("favoritesUpdated", updateFavoritesCount);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setShowSearch(false);
    }
  };

  const handleSearchIconClick = () => {
    if (showSearch && searchTerm.trim()) {
      handleSearch();
    } else {
      setShowSearch(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="nav-background"></div>
      <div className="top-left-nav">
        <Link href="/" className="store-logo">
          <img
            src="/icons/icon.png"
            alt="ShoeOutlet Icon"
            className="shoe-icon"
            width={24}
            height={24}
          />
          <span className="store-name">ShoeOutlet</span>
        </Link>
      </div>

      <div className="top-right-nav" ref={searchRef}>
        {isLargeScreen && (
          <input
            type="text"
            className={`search-input ${showSearch ? "show" : "hide"}`}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus={showSearch}
          />
        )}

        <button className="icon-circle" onClick={handleSearchIconClick}>
          <span className="material-symbols-outlined">search</span>
        </button>

        <button
          className="icon-circle favorite-icon-wrapper"
          onClick={() => router.push("/favorites")}
        >
          <span className="material-symbols-outlined">favorite</span>
          {favoritesCount > 0 && (
            <span className="favorites-badge">{favoritesCount}</span>
          )}
        </button>

        <button
          className="icon-circle"
          id="shopping-cart-button"
          onClick={() => router.push("/cart")}
        >
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>

        {!isLargeScreen && (
          <input
            type="text"
            className={`mobile-search-input ${showSearch ? "show" : "hide"}`}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus={showSearch}
          />
        )}
      </div>
    </>
  );
};

export default NavBar;
