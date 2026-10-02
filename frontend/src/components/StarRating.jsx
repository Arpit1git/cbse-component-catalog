import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, totalReviews = null, editable = false, onChange = null, size = 16 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = editable && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(displayRating);
          return (
            <button
              key={star}
              type="button"
              disabled={!editable}
              onClick={() => editable && onChange && onChange(star)}
              onMouseEnter={() => editable && setHoverRating(star)}
              onMouseLeave={() => editable && setHoverRating(0)}
              className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform p-0.5' : 'cursor-default'}`}
              aria-label={`${star} star`}
            >
              <Star
                size={size}
                className={`${
                  filled 
                    ? 'fill-[#B7791F] text-[#B7791F]' 
                    : 'text-paper-border stroke-paper-muted/40'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {!editable && (
        <span className="text-xs font-semibold text-paper-text">
          {rating > 0 ? Number(rating).toFixed(1) : 'No ratings'}
        </span>
      )}

      {totalReviews !== null && (
        <span className="text-xs text-paper-muted">
          ({totalReviews})
        </span>
      )}
    </div>
  );
}
