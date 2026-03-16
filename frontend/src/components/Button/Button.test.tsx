import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'vitest-axe';
import Button from './Button';

describe('Button Component', () => {
    it('renders the button with text', () => {
        render(<Button variant="primary">Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
        const { container } = render(<Button variant="primary">Click Me</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when loading', async () => {
        const { container } = render(<Button variant="primary" isLoading>Loading...</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<Button variant="primary" onClick={handleClick}>Click Me</Button>);
        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when the disabled prop is passed or loading is true', () => {
        const { rerender } = render(<Button variant="primary" disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();

        // Testing loading state if applicable (most reusable buttons disable on load)
        rerender(<Button variant="primary" isLoading>Submit</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
