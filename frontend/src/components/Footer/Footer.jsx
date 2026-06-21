import React from "react";

export default function Footer() {
  return (
    <footer style={{
      background: "var(--bg-main)",
      borderTop: "1px solid var(--border-color)",
      padding: "2rem",
      textAlign: "center",
      color: "var(--text-secondary)",
      fontSize: "0.85rem",
      marginTop: "auto"
    }}>
      <p style={{ margin: "0 0 8px 0", fontStyle: "italic" }}>
        "Someone's already going. Let them bring yours too."
      </p>
      <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>
        &copy; {new Date().getFullYear()} Campus Runner. Peer-to-Peer Parcel Delivery Network.
      </p>
    </footer>
  );
}
