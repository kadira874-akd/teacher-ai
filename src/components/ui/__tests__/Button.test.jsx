import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  test('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('renders with default variant (primary)', () => {
    render(<Button>Test</Button>);
    const button = screen.getByText('Test').closest('button');
    expect(button).toHaveClass('from-[#4F46E5]');
  });

  test('applies secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary').closest('button');
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('border-slate-200');
  });

  test('applies danger variant correctly', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByText('Danger').closest('button');
    expect(button).toHaveClass('from-[#EF4444]');
  });

  test('applies success variant correctly', () => {
    render(<Button variant="success">Success</Button>);
    const button = screen.getByText('Success').closest('button');
    expect(button).toHaveClass('from-[#10B981]');
  });

  test('applies ghost variant correctly', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByText('Ghost').closest('button');
    expect(button).toHaveClass('bg-transparent');
  });

  test('applies outline variant correctly', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText('Outline').closest('button');
    expect(button).toHaveClass('border-[#4F46E5]');
  });

  test('applies small size correctly', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText('Small').closest('button');
    expect(button).toHaveClass('text-xs');
  });

  test('applies medium size correctly (default)', () => {
    render(<Button>Medium</Button>);
    const button = screen.getByText('Medium').closest('button');
    expect(button).toHaveClass('text-sm');
  });

  test('applies large size correctly', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText('Large').closest('button');
    expect(button).toHaveClass('text-base');
  });

  test('applies extra large size correctly', () => {
    render(<Button size="xl">XL</Button>);
    const button = screen.getByText('XL').closest('button');
    expect(button).toHaveClass('text-lg');
  });

  test('applies fullWidth correctly', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByText('Full Width').closest('button');
    expect(button).toHaveClass('w-full');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not fire click when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    
    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('disables button when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('renders loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('renders icon when provided', () => {
    render(<Button icon="🔥">With Icon</Button>);
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  test('does not render icon when loading', () => {
    render(<Button icon="🔥" loading>Loading</Button>);
    expect(screen.queryByText('🔥')).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText('Custom').closest('button');
    expect(button).toHaveClass('custom-class');
  });

  test('has correct type attribute (button by default)', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  test('accepts submit type', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('has press-effect class for animation', () => {
    render(<Button>Test</Button>);
    const button = screen.getByText('Test').closest('button');
    expect(button).toHaveClass('press-effect');
  });

  test('has focus ring styles', () => {
    render(<Button>Test</Button>);
    const button = screen.getByText('Test').closest('button');
    expect(button).toHaveClass('focus:ring-2');
  });

  test('has transition classes', () => {
    render(<Button>Test</Button>);
    const button = screen.getByText('Test').closest('button');
    expect(button).toHaveClass('transition-all');
    expect(button).toHaveClass('duration-200');
  });
});
