jest.mock('next-themes', () => ({
  useTheme: jest.fn().mockReturnValue({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
    systemTheme: 'light',
  }),
}));

import { render, fireEvent } from '@testing-library/react';
import { useTheme } from 'next-themes';
import ThemeButton from '../app/components/ThemeButton';

type UseThemeReturn = {
  theme?: string;
  setTheme: (theme: string) => void;
  resolvedTheme: string;
  autoResolvedTheme?: string;
  systemTheme?: string;
};

describe('ThemeButton', () => {
  it('toggles theme on click', () => {
    const setTheme = jest.fn();

    (useTheme as jest.Mock).mockReturnValue({
      setTheme,
      resolvedTheme: 'light',
    });

    const { getByRole } = render(<ThemeButton />);
    const button = getByRole('button');

    fireEvent.click(button);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
