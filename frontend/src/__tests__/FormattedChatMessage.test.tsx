import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FormattedChatMessage from '../components/dashboard/tutor/FormattedChatMessage';

describe('FormattedChatMessage Component Specs', () => {
  it('renders CORE IDEA educational card correctly', () => {
    render(<FormattedChatMessage content="💡 CORE IDEA: Energy cannot be created or destroyed." />);
    expect(screen.getByText('CORE IDEA')).toBeInTheDocument();
    expect(screen.getByText('Energy cannot be created or destroyed.')).toBeInTheDocument();
  });

  it('renders EXAM FOCUS educational card correctly', () => {
    render(<FormattedChatMessage content="🎯 EXAM FOCUS: Always state the unit of force in Newtons." />);
    expect(screen.getByText('EXAM FOCUS')).toBeInTheDocument();
    expect(screen.getByText('Always state the unit of force in Newtons.')).toBeInTheDocument();
  });

  it('renders COMMON MISTAKE warning card correctly', () => {
    render(<FormattedChatMessage content="⚠️ COMMON MISTAKE: Confusing speed with velocity." />);
    expect(screen.getByText('COMMON MISTAKE')).toBeInTheDocument();
    expect(screen.getByText('Confusing speed with velocity.')).toBeInTheDocument();
  });
});
