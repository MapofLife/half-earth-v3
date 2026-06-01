import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  NAVIGATION,
  SPECIES_SELECTED_COOKIE,
} from 'constants/dashboard-constants';

import SpeciesSearch from './index';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('components/button', () => ({
  default: ({ label, handleClick }) => (
    <button type="button" onClick={handleClick}>
      {label}
    </button>
  ),
}));

vi.mock('components/search-input', () => ({
  default: ({ placeholder, onChange, value, className }) => (
    <input
      aria-label={placeholder}
      className={className}
      onChange={onChange}
      value={value}
    />
  ),
}));

const createProps = (overrides = {}) => ({
  setSelectedIndex: vi.fn(),
  setScientificName: vi.fn(),
  setSelectedRegionOption: vi.fn(),
  setSelectedTaxa: vi.fn(),
  setSelectedRegion: vi.fn(),
  setExploreAllSpecies: vi.fn(),
  setTaxaList: vi.fn(),
  allTaxa: [
    {
      label: 'Mammals',
      species: [
        {
          scientificname: 'Panthera onca',
          common: ['Jaguar'],
        },
        {
          scientificname: 'Ateles paniscus',
          common: ['Spider Monkey'],
        },
      ],
    },
    {
      label: 'Birds',
      species: [
        {
          scientificname: 'Ara macao',
          common: ['Scarlet Macaw'],
        },
      ],
    },
  ],
  ...overrides,
});

const renderComponent = (overrides = {}) => {
  const props = createProps(overrides);
  const result = render(<SpeciesSearch {...props} />);
  return { ...result, props };
};

describe('SpeciesSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters species by scientific and common name through the index export', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('Search for a species by name'), {
      target: { value: 'jag' },
    });

    await waitFor(() => {
      expect(screen.getByText('Panthera onca')).toBeInTheDocument();
      expect(screen.getByText('Jaguar')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Search for a species by name'), {
      target: { value: 'scarlet' },
    });

    await waitFor(() => {
      expect(screen.getByText('Ara macao')).toBeInTheDocument();
      expect(screen.getByText('Scarlet Macaw')).toBeInTheDocument();
    });
  });

  it('selects a species result and stores the selected scientific name', async () => {
    const { props } = renderComponent();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    fireEvent.change(screen.getByLabelText('Search for a species by name'), {
      target: { value: 'panthera' },
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /panthera onca/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /panthera onca/i }));

    expect(props.setScientificName).toHaveBeenCalledWith('Panthera onca');
    expect(setItemSpy).toHaveBeenCalledWith(
      SPECIES_SELECTED_COOKIE,
      'Panthera onca'
    );
    expect(props.setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.DATA_LAYER);
  });

  it('resets region filters and explores all species', () => {
    const { props } = renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: 'Explore all Species' })
    );

    expect(props.setSelectedRegion).toHaveBeenCalledWith(null);
    expect(props.setSelectedRegionOption).toHaveBeenCalledWith(null);
    expect(props.setSelectedTaxa).toHaveBeenCalledWith(null);
    expect(props.setExploreAllSpecies).toHaveBeenCalledWith(true);
    expect(props.setTaxaList).toHaveBeenCalledWith(props.allTaxa);
    expect(props.setSelectedIndex).toHaveBeenCalledWith(
      NAVIGATION.EXPLORE_SPECIES
    );
  });
});
