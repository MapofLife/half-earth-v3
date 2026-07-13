import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import ScoreDistributionsSpiComponent from './score-distributions-spi-component';

let chartProps;

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
    default: (props) => {
      chartProps = props;
      return (
        <button
          type="button"
          data-testid="distribution-chart"
          onClick={() =>
            props.options?.onClick?.(
              null,
              [
                {
                  datasetIndex: 0,
                  index: 0,
                  label: '0',
                },
              ],
              {}
            )
          }
        >
          chart
        </button>
      );
    },
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
  beforeEach(() => {
    chartProps = undefined;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('requests bucket species when chart bars are clicked', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSpiComponent
          activeTrend="NATIONAL"
          selectedProvince={{ region_name: 'Loreto', region_key: 'loreto' }}
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
          spiSelectSpeciesData={[]}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('distribution-chart')).toBeInTheDocument();
      expect(chartProps).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('distribution-chart'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('uses marine datasets and appends marine query params for bucket requests', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSpiComponent
          activeTrend="NATIONAL"
          selectedProvince={{ region_name: 'Loreto', region_key: 'loreto' }}
          setSelectedIndex={vi.fn()}
          setScientificName={vi.fn()}
          setMapLegendLayers={vi.fn()}
          spiScoresData={[]}
          spiMarineScoresData={[
            {
              bin: '0, five',
              fishes_marine_sps_count: 2,
              mammals_marine_sps_count: 1,
            },
          ]}
          spiSelectSpeciesData={[{ species_sps: [] }]}
          spiSelectMarineSpeciesData={[
            {
              species_sps: [
                {
                  species: 'Fishus marinus',
                  commonname: 'Marine Fish',
                  species_url: 'fish-image',
                  sps_score: 2.1,
                  taxa: 'fishes_marine',
                },
                {
                  species: 'Mammalus marinus',
                  commonname: 'Marine Mammal',
                  species_url: 'mammal-image',
                  sps_score: 3.4,
                  taxa: 'mammals_marine',
                },
              ],
            },
          ]}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="PER"
          spiActiveTrend="MARINE"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('distribution-chart')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('distribution-chart'));

    await waitFor(() => {
      const bucketCall = global.fetch.mock.calls.find(([url]) =>
        String(url).includes('filter_by=sps')
      );
      expect(bucketCall).toBeTruthy();
      expect(bucketCall[0]).toContain('marine=True');
    });
  });

  it('formats SPI tooltip titles using score buckets', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSpiComponent
          activeTrend="NATIONAL"
          selectedProvince={{ region_name: 'Loreto', region_key: 'loreto' }}
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
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(chartProps).toBeDefined();
    });

    expect(
      chartProps.options.plugins.tooltip.callbacks.title([{ label: '10' }])
    ).toBe('10 - 15');
  });

  it('uses non-EE zone histogram data for accepted zone trends', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSpiComponent
          activeTrend="ZONE_3"
          selectedProvince={{ region_name: 'Cusco', region_key: 'ACC_3_CUSCO' }}
          setSelectedIndex={vi.fn()}
          setScientificName={vi.fn()}
          setMapLegendLayers={vi.fn()}
          spiScoresData={[]}
          spiSelectSpeciesData={[]}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[
            {
              region_key: 'ACC_3_CUSCO',
              project: 'per',
              bin: '0, five',
              birds_spi_count: 2,
              mammals_spi_count: 1,
              reptiles_spi_count: 0,
              amphibians_spi_count: 3,
              species_sps: [
                {
                  species: 'Zoneus peru',
                  commonname: 'Peru Zone Species',
                  species_url: 'zone-image',
                  spi_score: 6.2,
                  stewardship: 0.3,
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
      expect(screen.getByText('Peru Zone Species')).toBeInTheDocument();
      expect(screen.getByTestId('distribution-chart')).toBeInTheDocument();
    });
  });

  it('does not request bucket species when chart click has no selected elements', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsSpiComponent
          activeTrend="NATIONAL"
          selectedProvince={{ region_name: 'Loreto', region_key: 'loreto' }}
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
          spiSelectSpeciesData={[]}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(chartProps).toBeDefined();
    });

    global.fetch.mockClear();
    chartProps.options.onClick(null, []);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
