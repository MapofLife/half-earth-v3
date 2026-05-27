import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import {
  NAVIGATION,
  SPECIES_SELECTED_COOKIE,
} from 'constants/dashboard-constants';
import SpeciesHomeComponent from './species-home-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('components/species-search', () => ({
  default: () => <div data-testid="species-search" />,
}));

describe('SpeciesHomeComponent', () => {
  it('renders search and selects a priority species', () => {
    const setSelectedIndex = vi.fn();
    const setScientificName = vi.fn();
    const setExploreAllSpecies = vi.fn();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <SpeciesHomeComponent
          setSelectedIndex={setSelectedIndex}
          setScientificName={setScientificName}
          setExploreAllSpecies={setExploreAllSpecies}
          prioritySpeciesList={[
            {
              species_name: 'Panthera onca',
              image_url: 'jaguar.jpg',
              local_name: 'Jaguar',
              common_name_en: 'Jaguar',
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    expect(screen.getByTestId('species-search')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /jaguar/i }));

    expect(setExploreAllSpecies).toHaveBeenCalledWith(false);
    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.DATA_LAYER);
    expect(setScientificName).toHaveBeenCalledWith('Panthera onca');
    expect(setItemSpy).toHaveBeenCalledWith(
      SPECIES_SELECTED_COOKIE,
      'Panthera onca'
    );
  });

  it('renders without popular species when the list is empty', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <SpeciesHomeComponent
          setSelectedIndex={vi.fn()}
          setScientificName={vi.fn()}
          setExploreAllSpecies={vi.fn()}
          prioritySpeciesList={[]}
        />
      </LightModeContext.Provider>
    );

    expect(screen.getByTestId('species-search')).toBeInTheDocument();
    expect(screen.queryByText('Popular Species')).not.toBeInTheDocument();
  });

  it('falls back to the english common name when the local name is missing', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: true }}>
        <SpeciesHomeComponent
          setSelectedIndex={vi.fn()}
          setScientificName={vi.fn()}
          setExploreAllSpecies={vi.fn()}
          prioritySpeciesList={[
            {
              species_name: 'Bitis nasicornis',
              image_url: 'viper.jpg',
              local_name: '',
              common_name_en: 'Rhino Viper',
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    expect(
      screen.getByRole('button', { name: /rhino viper/i })
    ).toBeInTheDocument();
  });
});
