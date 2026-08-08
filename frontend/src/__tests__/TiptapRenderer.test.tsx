import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TiptapRenderer from '../components/notes/TiptapRenderer';
import ComparisonBlock from '../components/notes/ComparisonBlock';
import InteractiveQuizBlock from '../components/notes/InteractiveQuizBlock';

describe('ScholarOS Structured TiptapRenderer & Custom Blocks Specs', () => {
  it('renders structured Tiptap JSON heading and paragraph correctly', () => {
    const sampleDoc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Quantum Physics Fundamentals' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Wave-particle duality governs microscopic systems.' }]
        }
      ]
    };

    render(<TiptapRenderer tiptapJson={sampleDoc} />);
    expect(screen.getByText('Quantum Physics Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Wave-particle duality governs microscopic systems.')).toBeInTheDocument();
  });

  it('renders ComparisonBlock in two-column and mobile stacked formats', () => {
    render(
      <ComparisonBlock
        title="DNA vs RNA Comparison"
        headers={['DNA', 'RNA']}
        rows={[['Double-stranded helix', 'Single-stranded chain']]}
      />
    );
    expect(screen.getByText('DNA vs RNA Comparison')).toBeInTheDocument();
    expect(screen.getAllByText('Double-stranded helix').length).toBeGreaterThan(0);
  });

  it('renders InteractiveQuizBlock with options', () => {
    render(
      <InteractiveQuizBlock
        question="What is the unit of electric current?"
        options={['Ampere', 'Volt', 'Ohm', 'Watt']}
        correctAnswer={0}
      />
    );
    expect(screen.getByText('What is the unit of electric current?')).toBeInTheDocument();
    expect(screen.getByText('Ampere')).toBeInTheDocument();
  });
});
