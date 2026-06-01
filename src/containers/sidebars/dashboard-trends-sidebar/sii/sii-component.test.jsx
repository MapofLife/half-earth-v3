import React from 'react';
import { render, screen } from '@testing-library/react';

import SiiComponent from './sii-component';

vi.mock('./score-distributions/score-distributions-sii-component', () => ({
  default: () => <div data-testid="sii-score-distribution" />,
}));

vi.mock('./temporal-trends/temporal-trends-sii-component', () => ({
  default: () => <div data-testid="sii-temporal-trends" />,
}));

describe('SiiComponent', () => {
  it('always renders temporal trends and score distributions', () => {
    render(<SiiComponent countryISO="EE" />);

    expect(screen.getByTestId('sii-temporal-trends')).toBeInTheDocument();
    expect(screen.getByTestId('sii-score-distribution')).toBeInTheDocument();
  });
});
