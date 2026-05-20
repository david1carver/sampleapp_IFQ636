// frontend/src/components/mesa/StarRating.jsx
// Ported from mesa-app/components/mesa/star-rating.tsx — drops lucide-react dep for inline SVG.

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-10 h-10',
};

function cn(...c) {
  return c.filter(Boolean).join(' ');
}

function StarIcon({ className, filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showValue = false,
  reviewCount,
}) {
  const handleClick = (index) => {
    if (interactive && onRatingChange) onRatingChange(index + 1);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(rating);
          const partial = index === Math.floor(rating) && rating % 1 !== 0;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!interactive}
              className={cn(
                'relative transition-transform',
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              )}
              aria-label={`${index + 1} star${index === 0 ? '' : 's'}`}
            >
              <StarIcon className={cn(SIZE_CLASSES[size], 'text-border')} filled={false} />
              {(filled || partial) && (
                <StarIcon
                  className={cn(SIZE_CLASSES[size], 'absolute inset-0 text-stars')}
                  filled
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 font-semibold text-foreground">{rating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="ml-1 text-muted-foreground text-sm">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
