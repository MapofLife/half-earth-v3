import React from 'react';
import { render, screen } from '@testing-library/react';

import ShiComponent from './shi-component';

vi.mock('./score-distributions/score-distributions-shi-component', () => ({
  default: () => <div data-testid="shi-score-distribution" />,
}));

vi.mock('./temporal-trends/temporal-trends-shi-component', () => ({
  default: () => <div data-testid="shi-temporal-trends" />,
}));

describe('ShiComponent', () => {
  it('hides score distributions for EE without a clicked region', () => {
    render(<ShiComponent countryISO="EE" clickedRegion={null} />);

    expect(screen.getByTestId('shi-temporal-trends')).toBeInTheDocument();
    expect(
      screen.queryByTestId('shi-score-distribution')
    ).not.toBeInTheDocument();
  });

  it('shows score distributions for non-EE countries and clicked EE regions', () => {
    const { rerender } = render(
      <ShiComponent countryISO="PER" clickedRegion={null} />
    );

    expect(screen.getByTestId('shi-score-distribution')).toBeInTheDocument();

    rerender(<ShiComponent countryISO="EE" clickedRegion={{ iso3: 'MEX' }} />);
    expect(screen.getByTestId('shi-score-distribution')).toBeInTheDocument();
  });
});
