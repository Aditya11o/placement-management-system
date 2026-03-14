import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const variants: Variants = {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    animate: { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        transition: { 
            duration: 0.5, 
            ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for "Elite" smoothness 
        } 
    },
    exit: { 
        opacity: 0, 
        scale: 1.02, 
        y: -10, 
        transition: { 
            duration: 0.3, 
            ease: [0.22, 1, 0.36, 1] 
        } 
    }
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
