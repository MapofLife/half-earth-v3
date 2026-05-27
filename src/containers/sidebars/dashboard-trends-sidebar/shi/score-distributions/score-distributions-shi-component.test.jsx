import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import ScoreDistributionsShiComponent from './score-distributions-shi-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
  T: ({ _str }) => <span>{_str}</span>,
}));

vi.mock('@transifex/native', () => ({
  tx: { currentLocale: 'en' },
}));

vi.mock('utils/css-utils', () => ({
  getCSSVariable: (value) => value,
}));

vi.mock('he-components', () => ({
  Loading: () => <div data-testid="loading" />,
}));

vi.mock('components/button', () => ({
  default: ({ label, handleClick }) => (
    <button type="button" onClick={handleClick}>
      {label}
    </button>
  ),
}));

vi.mock('components/chart-info-popup/chart-info-component', () => ({
  default: ({ children }) => <div data-testid="chart-info">{children}</div>,
}));

vi.mock(
  'components/charts/distribution-chart/distribution-chart-component',
  () => ({
    default: () => <div data-testid="distribution-chart" />,
  })
);

vi.mock('components/species-richness/species-richness-component', () => ({
  default: () => <div data-testid="species-richness" />,
}));

vi.mock('components/taxa-image', () => ({
  default: ({ taxa }) => <div data-testid={`taxa-${taxa}`} />,
}));

vi.mock('./distributions-table', () => ({
  default: () => <div data-testid="distributions-table" />,
}));

vi.mock('../../../dashboard-sidebar/tutorials/sections/sections-info', () => ({
  SECTION_INFO: { SHI_SCORE_DISTRIBUTIONS: 'shi info' },
}));

vi.mock('../../dashboard-trends-sidebar-component', () => ({
  NATIONAL_TREND: 'NATIONAL',
  PROVINCE_TREND: 'PROVINCE',
  ZONE_3: 'ZONE_3',
  ZONE_5: 'ZONE_5',
}));

vi.mock(
  'images/dashboard/tutorials/tutorial_shi_scoreDist-en.png?react',
  () => ({
    default: 'shi-en',
  })
);

vi.mock(
  'images/dashboard/tutorials/tutorial_shi_scoreDist-fr.png?react',
  () => ({
    default: 'shi-fr',
  })
);

describe('ScoreDistributionsShiComponent', () => {
  it('renders score distributions and allows selecting a highlighted species', async () => {
    const setScientificName = vi.fn();
    const setSelectedIndex = vi.fn();
    const setMapLegendLayers = vi.fn();
    const setFromTrends = vi.fn();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsShiComponent
          setScientificName={setScientificName}
          setSelectedIndex={setSelectedIndex}
          shiScoresData={[
            {
              bin: '0, habitat',
              amphibians: 1,
              birds: 2,
              mammals: 3,
              reptiles: 4,
            },
          ]}
          shiSelectSpeciesData={[
            {
              species_shs: [
                {
                  species: 'Pipra aureola',
                  commonname: 'Crimson-hooded Manakin',
                  species_url: 'image',
                  shs_score: 84.6,
                  taxa: 'birds',
                },
              ],
            },
          ]}
          shiActiveTrend="NATIONAL"
          setMapLegendLayers={setMapLegendLayers}
          selectedProvince={{ region_name: 'Cusco', region_key: 'cusco' }}
          setFromTrends={setFromTrends}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    expect(screen.getByText('Score Distributions')).toBeInTheDocument();
    expect(screen.getByTestId('species-richness')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Crimson-hooded Manakin')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Crimson-hooded Manakin'));

    expect(setMapLegendLayers).toHaveBeenCalledWith([]);
    expect(setFromTrends).toHaveBeenCalledWith(true);
    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.DATA_LAYER);
    expect(setScientificName).toHaveBeenCalledWith('Pipra aureola');
    expect(setItemSpy).toHaveBeenCalledWith(
      'species_selected',
      'Pipra aureola'
    );
  });
});
