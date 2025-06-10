"use client";
import React from "react";
import { useRouter } from "next/navigation";
import "./CategorySidebar.css";

type CategorySidebarProps = {
  show: boolean;
  categoriesMap: Record<string, Set<string>>;
  onToggle: () => void;
};

export default function CategorySidebar({
  show,
  categoriesMap,
  onToggle,
}: CategorySidebarProps) {
  const router = useRouter();

  const goToCategory = (gender: string, category: string) => {
    router.push(`/shop/${gender}/${category}`);
    onToggle();
  };

  return (
    <>
      <div className={`sidebar-toggle-container ${show ? "open" : ""}`}>
        <button
          className={`sidebar-toggle-button ${show ? "open" : ""}`}
          onClick={onToggle}
          aria-label="Toggle Sidebar"
        >
          <span className="arrow" />
        </button>
      </div>

      <div className={`left-sidebar ${show ? "show" : ""}`}>
        <div className="panel-top"></div>
        <div className="collection-content">
          <h3>Categories</h3>
          {Object.entries(categoriesMap).map(([gender, cats]) => (
            <div key={gender}>
              <strong>{gender}</strong>
              <ul>
                {[...cats].map((cat) => (
                  <li key={cat}>
                    <button onClick={() => goToCategory(gender, cat)}>
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
