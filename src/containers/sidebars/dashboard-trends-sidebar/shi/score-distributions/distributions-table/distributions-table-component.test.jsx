import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import DistributionsTableComponent from './distributions-table-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('icons/arrow_down.svg?react', () => ({
  default: ({ onClick }) => (
    <button type="button" data-testid="arrow-down" onClick={onClick} />
  ),
}));

vi.mock('icons/arrow_up.svg?react', () => ({
  default: ({ onClick }) => (
    <button type="button" data-testid="arrow-up" onClick={onClick} />
  ),
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

  it('calls handleSortChange when sort arrows are clicked', () => {
    const handleSortChange = vi.fn();

    render(
      <DistributionsTableComponent
        handleSortChange={handleSortChange}
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

    screen
      .getAllByTestId('arrow-up')
      .forEach((arrow) => fireEvent.click(arrow));
    screen
      .getAllByTestId('arrow-down')
      .forEach((arrow) => fireEvent.click(arrow));

    expect(handleSortChange).toHaveBeenCalledTimes(14);
    expect(handleSortChange).toHaveBeenCalledWith({
      value: 'NAME',
      ascending: true,
    });
    expect(handleSortChange).toHaveBeenCalledWith({
      value: 'AREA_KM',
      ascending: false,
    });
  });
});
