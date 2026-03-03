import React from 'react';
import './Card.css';

const Card = ({ children, className = '', hoverable = false, ...props }) => {
    return (
        <div
            className={`card glass-panel ${hoverable ? 'card-hoverable' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
