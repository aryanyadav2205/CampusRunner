import React, { useState } from "react";
import { Star } from "lucide-react";

export default function RatingCard({ 
  rating = 5, 
  comment = "", 
  isInput = false, 
  onRatingChange, 
  onCommentChange 
}) {
  const [hoverRating, setHoverRating] = useState(0);

  if (isInput) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        background: "rgba(15, 23, 42, 0.4)",
        padding: "1rem",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
            Select Rating Stars
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3, 4, 5].map((starValue) => {
              const active = starValue <= (hoverRating || rating);
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => onRatingChange(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: active ? "#eab308" : "var(--text-secondary)",
                    transition: "transform 0.1s, color 0.1s"
                  }}
                  className="star-button-hover"
                >
                  <Star fill={active ? "#eab308" : "none"} size={28} />
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
            Leave Feedback Comment (Optional)
          </label>
          <textarea
            placeholder="Describe your delivery experience..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={3}
            style={{
              background: "var(--bg-main)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "var(--text-primary)",
              fontFamily: "inherit",
              resize: "none",
              fontSize: "0.9rem"
            }}
          />
        </div>
      </div>
    );
  }

  // Static display mode
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      borderRadius: "12px",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const filled = starValue <= rating;
          return (
            <Star 
              key={starValue} 
              size={14} 
              fill={filled ? "#eab308" : "none"} 
              color={filled ? "#eab308" : "var(--text-secondary)"} 
            />
          );
        })}
      </div>
      {comment && (
        <p style={{
          margin: 0,
          fontSize: "0.875rem",
          color: "var(--text-primary)",
          fontStyle: "italic",
          lineHeight: "1.4"
        }}>
          "{comment}"
        </p>
      )}
    </div>
  );
}
