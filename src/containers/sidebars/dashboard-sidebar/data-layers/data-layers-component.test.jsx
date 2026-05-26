import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import { DASHBOARD_URLS } from 'constants/layers-urls';

import DataLayerComponent from './data-layers-component';

const groupedListSpy = vi.fn();
const lineSpy = vi.fn();
const mockGetToken = vi.fn();

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Tooltip: {},
  Legend: {},
  CategoryScale: {},
  Filler: {},
}));

vi.mock('react-chartjs-2', () => ({
  Line: (props) => {
    lineSpy(props);
    return <div data-testid="habitat-line-chart" />;
  },
}));

vi.mock('he-components', () => ({
  Modal: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
  Loading: () => <div data-testid="loading" />,
}));

vi.mock('components/button', () => ({
  default: ({ label, handleClick, className }) => (
    <button className={className} onClick={handleClick} type="button">
      {label}
    </button>
  ),
}));

vi.mock('components/species-search', () => ({
  default: () => <div data-testid="species-search" />,
}));

vi.mock('../species-info', () => ({
  default: ({ speciesInfo }) => <div>{speciesInfo.scientificname}</div>,
}));

vi.mock('./grouped-list', () => ({
  default: (props) => {
    groupedListSpy(props);
    return (
      <div data-testid={`grouped-${props.dataPoints?.[0]?.label || 'empty'}`}>
        <span>{props.dataPoints?.map((item) => item.label).join('|')}</span>
        {props.setShowHabitatChart && (
          <button type="button" onClick={() => props.setShowHabitatChart(true)}>
            show habitat chart
          </button>
        )}
      </div>
    );
  },
}));

vi.mock('hooks/useJWTToken', () => ({
  default: () => ({ getToken: mockGetToken }),
}));

const buildFetchResponse = (data, ok = true) => ({
  ok,
  json: vi.fn().mockResolvedValue(data),
});

const createProps = (overrides = {}) => ({
  speciesInfo: {
    scientificname: 'Ateles paniscus',
    taxa: 'MAMMALS',
  },
  dataLayerData: [
    {
      type_title: 'EXPERT RANGE MAPS',
      dataset_id: 'ec694c34-bddd-4111-ba99-926a5f7866e8',
      dataset_title: 'MDD Mammals 2021',
      label: 'MDD Mammals 2021',
      no_rows: 2,
    },
    {
      type_title: 'POINT OBSERVATIONS',
      dataset_id: '9905692e-6a28-4310-b01e-476a471e5bf8',
      dataset_title: 'GBIF',
      label: 'GBIF',
      no_rows: 4,
    },
  ],
  selectedRegion: null,
  setSelectedIndex: vi.fn(),
  setSpeciesInfo: vi.fn(),
  setScientificName: vi.fn(),
  setDataLayerData: vi.fn(),
  privateOccurrenceData: [],
  setMapLegendLayers: vi.fn(),
  exploreAllSpecies: false,
  mapLegendLayers: [],
  regionLayers: {},
  fromTrends: false,
  dataByCountry: { Guyana: {} },
  setSpeciesDataLoading: vi.fn(),
  countryISO: 'GUY',
  countryName: 'Guyana',
  map: { remove: vi.fn() },
  setSnackBar: vi.fn(),
  richnessRarityLegendInfo: [],
  ...overrides,
});

const renderComponent = (overrides = {}) => {
  const props = createProps(overrides);
  const result = render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <DataLayerComponent {...props} />
    </LightModeContext.Provider>
  );

  return { ...result, props };
};

describe('DataLayerComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('jwt-token');
    global.fetch = vi.fn((url) => {
      if (`${url}`.includes(DASHBOARD_URLS.CREATE_FEEDBACK_URL)) {
        return Promise.resolve(buildFetchResponse({}, true));
      }

      return Promise.resolve(
        buildFetchResponse({
          trend_data: [
            { year: 2020, value: 10 },
            { year: 2021, value: 12 },
          ],
          trend: { tile_url: 'trend-url' },
          prediction_map: { tile_url: 'prediction-url' },
          data: [],
          'range map': { tile_url: 'range-url' },
        })
      );
    });
  });

  it('renders the fallback species search when species info is missing', () => {
    renderComponent({
      speciesInfo: null,
      dataLayerData: null,
      dataByCountry: null,
    });

    expect(
      screen.getByText(
        "Couln't retrieve any data for this species. Please search for another species."
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('species-search')).toBeInTheDocument();
  });

  it('groups public data and injects Guyana-specific region layers', async () => {
    renderComponent();

    await waitFor(() => {
      expect(groupedListSpy).toHaveBeenCalled();
    });

    const publicCall = groupedListSpy.mock.calls.find(([props]) =>
      props.dataPoints?.some((item) => item.id === 'HABITAT')
    );
    expect(publicCall[0].dataPoints.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        'EXPERT_RANGE_MAPS',
        'POINT_OBSERVATIONS',
        'PREDICTION_MAPS',
        'SDM',
        'HABITAT',
      ])
    );

    const otherDataCall = groupedListSpy.mock.calls.find(([props]) =>
      props.dataPoints?.some((item) => item.id === 'INDIGENOUS_LANDS')
    );
    expect(otherDataCall[0].dataPoints.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        'PROTECTED_AREAS',
        'ADMINISTRATIVE_LAYERS',
        'INDIGENOUS_LANDS',
      ])
    );
  });

  it('shows the habitat chart when habitat data exists and the grouped list enables it', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('show habitat chart')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('show habitat chart'));

    await waitFor(() => {
      expect(screen.getByTestId('habitat-line-chart')).toBeInTheDocument();
      expect(lineSpy).toHaveBeenCalled();
    });
  });

  it('clears local state and returns to trends when back is clicked from trends', async () => {
    const mapLayer = { id: 'EXPERT_RANGE_MAPS' };
    const { props } = renderComponent({
      fromTrends: true,
      mapLegendLayers: [{ id: 'expert_range_maps' }],
      regionLayers: { EXPERT_RANGE_MAPS: mapLayer },
    });

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back'));

    expect(props.setDataLayerData).toHaveBeenCalledWith(null);
    expect(props.setSpeciesInfo).toHaveBeenCalledWith(null);
    expect(props.setScientificName).toHaveBeenCalledWith(null);
    expect(props.map.remove).toHaveBeenCalledWith(mapLayer);
    expect(props.setMapLegendLayers).toHaveBeenCalledWith([]);
    expect(props.setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.TRENDS);
  });

  it('submits feedback and resets the modal state on success', async () => {
    const { props } = renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Enviar comentarios sobre los datos')
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getAllByText('Enviar comentarios sobre los datos')[0]
    );
    fireEvent.click(
      screen.getByLabelText('There is an issue with expert range map')
    );
    fireEvent.change(
      screen.getByPlaceholderText('Add additional comments for data issues...'),
      { target: { value: 'Problem details' } }
    );
    fireEvent.click(screen.getByText('Send Feedback'));

    await waitFor(() => {
      expect(mockGetToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        DASHBOARD_URLS.CREATE_FEEDBACK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            ISO3: 'GUY',
            Authorization: 'Bearer jwt-token',
          }),
        })
      );
      expect(props.setSnackBar).toHaveBeenCalledWith({
        open: true,
        message: 'Thank you for your feedback!',
      });
    });
  });

  it('shows an error snackbar when feedback submission fails', async () => {
    global.fetch = vi.fn((url) => {
      if (`${url}`.includes(DASHBOARD_URLS.CREATE_FEEDBACK_URL)) {
        return Promise.resolve(buildFetchResponse({}, false));
      }

      return Promise.resolve(
        buildFetchResponse({
          trend_data: [],
          trend: { tile_url: 'trend-url' },
          prediction_map: { tile_url: 'prediction-url' },
          data: [],
          'range map': { tile_url: 'range-url' },
        })
      );
    });

    const { props } = renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Enviar comentarios sobre los datos')
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getAllByText('Enviar comentarios sobre los datos')[0]
    );
    fireEvent.click(screen.getByText('Send Feedback'));

    await waitFor(() => {
      expect(props.setSnackBar).toHaveBeenCalledWith({
        open: true,
        message:
          'There was an issue submitting your feedback. Please try again later.',
      });
    });
  });

  it('goes back to explore species when a region is selected', async () => {
    const { props } = renderComponent({
      selectedRegion: { id: 'region-1' },
    });

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back'));

    expect(props.setSelectedIndex).toHaveBeenCalledWith(
      NAVIGATION.EXPLORE_SPECIES
    );
  });

  it('uses the fallback data series path when trend_data is absent', async () => {
    global.fetch = vi.fn((url) => {
      if (`${url}`.includes(DASHBOARD_URLS.CREATE_FEEDBACK_URL)) {
        return Promise.resolve(buildFetchResponse({}, true));
      }

      return Promise.resolve(
        buildFetchResponse({
          trend_data: [],
          trend: { tile_url: 'trend-url' },
          prediction_map: { tile_url: 'prediction-url' },
          data: [
            ['Year', 'Unused', 'Low', 'High'],
            [2020, null, 2, 4],
            [2021, null, 3, 5],
          ],
          'range map': { tile_url: 'range-url' },
        })
      );
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('show habitat chart')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('show habitat chart'));

    await waitFor(() => {
      expect(lineSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ labels: [2020, 2021] }),
        })
      );
    });
  });

  it('renders Peru-specific feedback labels and closes the modal on cancel', async () => {
    renderComponent({ countryISO: 'PER', countryName: 'Peru' });

    await waitFor(() => {
      expect(screen.getByText('Cultivos de Perú')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Cultivos de Perú')[0]);

    expect(screen.getByText('Problemas con los datos')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(
      screen.queryByText('Problemas con los datos')
    ).not.toBeInTheDocument();
  });

  it('renders Peru-specific land pressure headings and private occurrence data', async () => {
    renderComponent({
      countryISO: 'PER',
      countryName: 'Peru',
      privateOccurrenceData: [
        {
          study_name: 'Private survey',
          type_title: 'POINT OBSERVATIONS',
          no_rows: 2,
        },
        {
          study_name: 'Private survey',
          type_title: 'POINT OBSERVATIONS',
          no_rows: 2,
        },
      ],
    });

    await waitFor(() => {
      expect(
        screen.getByText('Capas de presión por uso del suelo')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Capas de presión para uso marino')
      ).toBeInTheDocument();
      expect(groupedListSpy).toHaveBeenCalled();
    });

    const privateCall = groupedListSpy.mock.calls.find(
      ([props]) => props.isPrivate
    );
    expect(privateCall[0].dataPoints[0].showChildren).toBe(true);
    expect(privateCall[0].dataPoints[0].items[0]).toEqual(
      expect.objectContaining({
        dataset_title: 'Private survey',
        id: 'Private survey',
        no_rows: 2,
        type: 'PRIVATE',
      })
    );
  });

  it('adds EE intervention layers to the regions grouped list', async () => {
    renderComponent({
      countryISO: 'EE',
      countryName: 'Ecuador',
      dataByCountry: { Ecuador: {} },
    });

    await waitFor(() => {
      expect(groupedListSpy).toHaveBeenCalled();
    });

    const regionsCall = groupedListSpy.mock.calls.find(([props]) =>
      props.dataPoints?.some((item) => item.id === 'EEWWF_COUNTRY_LINES')
    );

    expect(regionsCall[0].dataPoints.map((item) => item.id)).toEqual(
      expect.arrayContaining(['EEWWF_COUNTRY_LINES'])
    );
  });

  it('adds an expert range child from habitat data when public layer data is empty', async () => {
    renderComponent({
      speciesInfo: {
        scientificname: 'Ara macao',
        taxa: 'BIRDS',
      },
      dataLayerData: [],
      dataByCountry: { Guyana: {} },
    });

    await waitFor(() => {
      expect(groupedListSpy).toHaveBeenCalled();
    });

    const expertRangeCall = groupedListSpy.mock.calls.find(([props]) =>
      props.dataPoints?.some((item) => item.id === 'EXPERT_RANGE_MAPS')
    );

    expect(expertRangeCall[0].dataPoints[0].items[0]).toEqual(
      expect.objectContaining({ dataset_title: 'Jetzmap 2025' })
    );
  });
});
