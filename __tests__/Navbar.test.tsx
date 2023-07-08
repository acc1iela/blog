import { render, screen } from '@testing-library/react';
import Navbar from '../app/components/Navbar';
import '@testing-library/jest-dom';

describe('Navbar', () => {
  it('renders without crashing', () => {
    render(<Navbar />);
    expect(screen.getByRole('heading')).toHaveTextContent('acc1iela Blog');
  });

  it('contains Themebutton', () => {
    render(<Navbar />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('contains link to home page', () => {
    render(<Navbar />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/');
  });
});
