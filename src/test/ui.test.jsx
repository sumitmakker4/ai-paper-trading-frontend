import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Input } from '../components/ui/Controls';
import { Tabs } from '../components/ui/Tabs';
import { AuthLayout } from '../features/auth/AuthLayout';

describe('shared controls', () => {
  it('associates input errors with their fields', () => {
    render(<Input label="Quantity" error="Enter a whole number" />);
    expect(screen.getByLabelText('Quantity')).toHaveAccessibleDescription('Enter a whole number');
    expect(screen.getByLabelText('Quantity')).toHaveAttribute('aria-invalid', 'true');
  });
  it('switches auth page themes through an accessible button', async () => {
    const user = userEvent.setup();
    render(<AuthLayout title="Sign in" subtitle="Your account" />);
    const button = screen.getByRole('button', { name: /Switch to/ });
    const nextTheme = button.getAttribute('aria-label').includes('light') ? 'light' : 'dark';
    await user.click(button);
    expect(document.documentElement).toHaveAttribute('data-theme', nextTheme);
  });
  it('supports arrow, Home and End keys in tabs', async () => {
    function Example() {
      const [value, setValue] = useState('one');
      return (
        <Tabs
          label="Preferences"
          value={value}
          onChange={setValue}
          items={[
            { value: 'one', label: 'One', content: 'First panel' },
            { value: 'two', label: 'Two', content: 'Second panel' },
          ]}
        />
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    screen.getByRole('tab', { name: 'One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel');
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
  });
});
