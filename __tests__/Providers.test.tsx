import { render, screen } from '@testing-library/react';
import { Providers } from '../app/components/Providers';

describe('Providers', () => {
  it('renders without crashing', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
