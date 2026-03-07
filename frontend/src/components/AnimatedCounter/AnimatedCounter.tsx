import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
    value?: number;
    duration?: number;
    className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value = 0, className = '' }) => {
    // Spring physics configuration for a smooth settling effect
    const springValue = useSpring(0, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // When the target value changes, animate the spring to the new value
    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    // Transform the raw floating-point spring value into a displayable format
    // For numbers > 100 we round, for percentages (< 100 but decimal) we can keep decimals if needed
    // Assuming these are mostly whole stats (students, jobs) based on the dashboard design
    const displayValue = useTransform(springValue, (current) => {
        return Math.round(current).toLocaleString();
    });

    return (
        <motion.span className={className}>
            {displayValue}
        </motion.span>
    );
};

export default AnimatedCounter;
