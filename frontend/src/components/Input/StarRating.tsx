import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    maxStars?: number;
    readOnly?: boolean;
    size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
    value,
    onChange,
    maxStars = 5,
    readOnly = false,
    size = 20
}) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const activeValue = hoverValue !== null ? hoverValue : value;

    return (
        <div
            className={`flex items-center gap-1 ${readOnly ? '' : 'cursor-pointer'}`}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
        >
            {[...Array(maxStars)].map((_, index) => {
                const starValue = index + 1;
                const isActive = starValue <= activeValue;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readOnly}
                        onClick={() => !readOnly && onChange?.(starValue)}
                        onMouseEnter={() => !readOnly && setHoverValue(starValue)}
                        className={`transition-all duration-150 focus:outline-none ${readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95'}`}
                        aria-label={`Rate ${starValue} stars`}
                    >
                        <Star
                            size={size}
                            className={`transition-colors ${isActive
                                    ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                                    : 'fill-transparent text-slate-300 dark:text-slate-600'
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
