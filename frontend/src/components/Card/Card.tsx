import React, { ReactNode, useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLMotionProps<"div">, "hoverable" | "className" | "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
    children: ReactNode;
    hoverable?: boolean;
    className?: string;
    border?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, border = false, ...props }) => {
    // Spotlight Effect Setup
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);
    const boundsRef = useRef<HTMLDivElement>(null);

    function handleMouseMove({
        clientX,
        clientY,
    }: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (!boundsRef.current) return;
        const { left, top } = boundsRef.current.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const baseClasses = `relative overflow-hidden p-6 bg-white dark:bg-slate-800/90 backdrop-blur-xl ${border ? 'border-indigo-500/20 dark:border-indigo-400/20' : 'border-slate-100 dark:border-slate-700/50'} border rounded-2xl shadow-sm dark:shadow-none transition-all duration-300`;

    // We use framer-motion's whileHover for the spring effect instead of Tailwind classes
    const hoverScale = hoverable ? 1.01 : 1;
    const hoverY = hoverable ? -2 : 0;

    return (
        <motion.div
            ref={boundsRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{
                scale: hoverScale,
                y: hoverY,
                boxShadow: hoverable ? "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)" : undefined,
                borderColor: hoverable ? "rgba(99, 102, 241, 0.3)" : undefined
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${baseClasses} ${className}`}
            {...props}
        >
            {/* Spotlight Gradient Overlay */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 dark:group-hover:opacity-100"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: useMotionTemplate`
                        radial-gradient(
                            400px circle at ${mouseX}px ${mouseY}px,
                            rgba(99, 102, 241, 0.08),
                            transparent 80%
                        )
                    `,
                }}
            />
            {/* The actual content placed above the spotlight */}
            <div className="relative z-10 h-full flex flex-col">
                {children}
            </div>
        </motion.div>
    );
};

export default Card;
