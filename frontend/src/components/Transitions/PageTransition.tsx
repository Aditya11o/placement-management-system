import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const variants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: 'easeIn' } }
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
