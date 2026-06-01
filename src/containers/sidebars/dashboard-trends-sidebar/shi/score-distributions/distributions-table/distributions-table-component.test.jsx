import React from 'react';
import { render, screen } from '@testing-library/react';

import DistributionsTableComponent from './distributions-table-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('icons/arrow_down.svg?react', () => ({
  default: () => <svg data-testid="arrow-down" />,
}));

vi.mock('icons/arrow_up.svg?react', () => ({
  default: () => <svg data-testid="arrow-up" />,
}));

describe('DistributionsTableComponent', () => {
  it('renders distribution rows and headers', () => {
    render(
      <DistributionsTableComponent
        chartData={[
          {
            speciesgroup: 'Birds',
            taxa_scores: [
              {
                scientificname: 'Pipra aureola',
                steward_score: 1.2,
                area_score: 2.0,
                connectivity_score: 4.0,
              },
            ],
          },
        ]}
      />
    );

    expect(screen.getByText('Taxa')).toBeInTheDocument();
    expect(screen.getByText('Scientific Name')).toBeInTheDocument();
    expect(screen.getByText('Birds')).toBeInTheDocument();
    expect(screen.getByText('Pipra aureola')).toBeInTheDocument();
    expect(screen.getByText('1.2')).toBeInTheDocument();
    expect(screen.getByText('3.0')).toBeInTheDocument();
  });
});
