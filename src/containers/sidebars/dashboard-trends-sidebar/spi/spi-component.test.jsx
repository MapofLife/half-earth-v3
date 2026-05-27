import React from 'react';
import { render, screen } from '@testing-library/react';

import SpiComponent from './spi-component';

vi.mock('./score-distibutions/score-distributions-spi-component', () => ({
  default: () => <div data-testid="spi-score-distribution" />,
}));

vi.mock('./temporal-trends/temporal-trends-spi-component', () => ({
  default: () => <div data-testid="spi-temporal-trends" />,
}));

describe('SpiComponent', () => {
  it('hides score distributions for EE without a clicked region', () => {
    render(<SpiComponent countryISO="EE" clickedRegion={null} />);

    expect(screen.getByTestId('spi-temporal-trends')).toBeInTheDocument();
    expect(
      screen.queryByTestId('spi-score-distribution')
    ).not.toBeInTheDocument();
  });

  it('shows score distributions for non-EE countries and clicked EE regions', () => {
    const { rerender } = render(
      <SpiComponent countryISO="PER" clickedRegion={null} />
    );

    expect(screen.getByTestId('spi-score-distribution')).toBeInTheDocument();

    rerender(<SpiComponent countryISO="EE" clickedRegion={{ iso3: 'PER' }} />);
    expect(screen.getByTestId('spi-score-distribution')).toBeInTheDocument();
  });
});
