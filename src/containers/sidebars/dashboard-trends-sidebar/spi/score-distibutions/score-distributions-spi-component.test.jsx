import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import ScoreDistributionsSpiComponent from './score-distributions-spi-component';

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

vi.mock('components/species-richness/species-richness-component', () => ({
  default: () => <div data-testid="species-richness" />,
}));

vi.mock('components/taxa-image', () => ({
  default: ({ taxa }) => <div data-testid={`taxa-${taxa}`} />,
}));

vi.mock('../../../dashboard-sidebar/tutorials/sections/sections-info', () => ({
  SECTION_INFO: { SPI_SCORE_DISTRIBUTIONS: 'spi info' },
}));

vi.mock('../../dashboard-trends-sidebar-component', () => ({
  NATIONAL_TREND: 'NATIONAL',
  PROVINCE_TREND: 'PROVINCE',
}));

vi.mock(
  'images/dashboard/tutorials/tutorial_spi_scoreDist-en.png?react',
  () => ({
    default: 'spi-en',
  })
);

vi.mock(
  'images/dashboard/tutorials/tutorial_spi_scoreDist-fr.png?react',
  () => ({
    default: 'spi-fr',
  })
);

describe('ScoreDistributionsSpiComponent', () => {
  it('renders SPI score distributions and allows selecting a highlighted species', async () => {
    const setSelectedIndex = vi.fn();
    const setScientificName = vi.fn();
    const setMapLegendLayers = vi.fn();
    const setFromTrends = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSpiComponent
          activeTrend="NATIONAL"
          selectedProvince={{ region_name: 'Loreto', region_key: 'loreto' }}
          setSelectedIndex={setSelectedIndex}
          setScientificName={setScientificName}
          setMapLegendLayers={setMapLegendLayers}
          spiScoresData={[
            {
              bin: '0, five',
              birds: 2,
              mammals: 1,
              reptiles: 0,
              amphibians: 3,
            },
          ]}
          spiSelectSpeciesData={[
            {
              species_sps: [
                {
                  species: 'Pyrrhura egregia',
                  commonname: 'Fiery-shouldered Parakeet',
                  species_url: 'image',
                  sps_score: 1.2,
                  taxa: 'birds',
                },
              ],
            },
          ]}
          setFromTrends={setFromTrends}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fiery-shouldered Parakeet')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Fiery-shouldered Parakeet'));
    expect(setMapLegendLayers).toHaveBeenCalledWith([]);
    expect(setFromTrends).toHaveBeenCalledWith(true);
    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.DATA_LAYER);
    expect(setScientificName).toHaveBeenCalledWith('Pyrrhura egregia');
  });

  it('uses curated GUY species highlights for national trend', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSpiComponent
          activeTrend="NATIONAL"
          selectedProvince={{ region_name: 'Region', region_key: 'region' }}
          setSelectedIndex={vi.fn()}
          setScientificName={vi.fn()}
          setMapLegendLayers={vi.fn()}
          spiScoresData={[
            {
              bin: '0, five',
              birds: 2,
              mammals: 1,
              reptiles: 0,
              amphibians: 3,
            },
          ]}
          spiSelectSpeciesData={[{ species_sps: [] }]}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="GUY"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fiery-shouldered Parakeet')).toBeInTheDocument();
    });
  });

  it('loads species from zone histogram data for accepted EE zone trend', async () => {
    const setSelectedIndex = vi.fn();
    const setScientificName = vi.fn();
    const setMapLegendLayers = vi.fn();
    const setFromTrends = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSpiComponent
          activeTrend="MEX"
          selectedProvince={{ region_name: 'Mexico', region_key: 'MEX' }}
          setSelectedIndex={setSelectedIndex}
          setScientificName={setScientificName}
          setMapLegendLayers={setMapLegendLayers}
          spiScoresData={[
            {
              bin: '0, five',
              birds: 2,
              mammals: 1,
              reptiles: 0,
              amphibians: 3,
            },
          ]}
          spiSelectSpeciesData={[]}
          setFromTrends={setFromTrends}
          lang="en"
          countryISO="EE"
          zoneHistrogramData={[
            {
              project: 'eewwf',
              region_key: 'MEX',
              bin: '0, five',
              birds_spi_count: 2,
              mammals_spi_count: 1,
              reptiles_spi_count: 0,
              amphibians_spi_count: 3,
              species_sps: [
                {
                  species: 'Zoneus testi',
                  commonname: 'EE Zone Species',
                  species_url: 'zone-image',
                  spi_score: 8.4,
                  stewardship: 0.2,
                  taxa: 'birds',
                  threat_status: 'Least Concern',
                },
              ],
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('EE Zone Species')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('EE Zone Species'));
    expect(setMapLegendLayers).toHaveBeenCalledWith([]);
    expect(setFromTrends).toHaveBeenCalledWith(true);
    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.DATA_LAYER);
    expect(setScientificName).toHaveBeenCalledWith('Zoneus testi');
  });
});
