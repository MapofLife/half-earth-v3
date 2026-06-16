import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import ScoreDistributionsSiiComponent from './score-distributions-sii-component';

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

vi.mock('components/chart-info-popup/chart-info-component', () => ({
  default: ({ children }) => <div data-testid="chart-info">{children}</div>,
}));

vi.mock(
  'components/charts/distribution-chart/distribution-chart-component',
  () => ({
    default: () => <div data-testid="distribution-chart" />,
  })
);

vi.mock('components/taxa-image', () => ({
  default: ({ taxa }) => <div data-testid={`taxa-${taxa}`} />,
}));

vi.mock(
  '../../../../../components/species-richness/species-richness-component',
  () => ({
    default: () => <div data-testid="species-richness" />,
  })
);

vi.mock('../../../dashboard-sidebar/tutorials/sections/sections-info', () => ({
  SECTION_INFO: { SHI_SCORE_DISTRIBUTIONS: 'sii info' },
}));

vi.mock('../../dashboard-trends-sidebar-component', () => ({
  NATIONAL_TREND: 'NATIONAL',
  PROVINCE_TREND: 'PROVINCE',
}));

describe('ScoreDistributionsSiiComponent', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders species highlights and allows selecting a highlighted species', async () => {
    const setSelectedIndex = vi.fn();
    const setScientificName = vi.fn();
    const setMapLegendLayers = vi.fn();
    const setFromTrends = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSiiComponent
          siiScoresData={[
            { bin: '0, low', birds: 2, mammals: 1, reptiles: 0, amphibians: 3 },
          ]}
          siiSelectSpeciesData={[
            {
              species_sii: [
                {
                  species: 'Amazona ochrocephala',
                  commonname: 'Yellow-crowned Amazon',
                  species_url: 'image',
                  sis_stewardship: 34.2,
                  taxa: 'birds',
                },
              ],
            },
          ]}
          setMapLegendLayers={setMapLegendLayers}
          setFromTrends={setFromTrends}
          setSelectedIndex={setSelectedIndex}
          setScientificName={setScientificName}
          setSpsSpecies={vi.fn()}
          lang="en"
          selectedProvince={{ region_key: 'loreto' }}
          countryISO="PER"
          siiActiveTrend="NATIONAL"
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Yellow-crowned Amazon')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(4);

    fireEvent.click(screen.getByText('Yellow-crowned Amazon'));
    expect(setMapLegendLayers).toHaveBeenCalledWith([]);
    expect(setFromTrends).toHaveBeenCalledWith(true);
    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.DATA_LAYER);
    expect(setScientificName).toHaveBeenCalledWith('Amazona ochrocephala');
  });

  it('uses curated GUY species highlights for national trend', async () => {
    const setSpsSpecies = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSiiComponent
          siiScoresData={[
            {
              bin: '0, low',
              birds: 2,
              mammals: 1,
              reptiles: 0,
              amphibians: 3,
            },
          ]}
          siiSelectSpeciesData={[{ species_sii: [] }]}
          setMapLegendLayers={vi.fn()}
          setFromTrends={vi.fn()}
          setSelectedIndex={vi.fn()}
          setScientificName={vi.fn()}
          setSpsSpecies={setSpsSpecies}
          lang="en"
          selectedProvince={{ region_key: 'guy' }}
          countryISO="GUY"
          siiActiveTrend="NATIONAL"
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(setSpsSpecies).toHaveBeenCalled();
    });
  });
});
