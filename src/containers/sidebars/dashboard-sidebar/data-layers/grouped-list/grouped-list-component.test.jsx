import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { LightModeContext } from 'context/light-mode';
import {
  DATA_POINT_TYPE,
  LAYER_OPTIONS,
  LAYER_TITLE_TYPES,
} from 'constants/dashboard-constants';
import { DASHBOARD_URLS } from 'constants/layers-urls';
import {
  INDIGENOUS_LANDS_FEATURE_ID,
  APURIMAC_LANDCOVER_FEATURE_ID,
  PERU_CROPS_FEATURE_ID,
} from 'utils/dashboard-utils';
import {
  PERU_CROPS_LAYER,
  APURIMAC_LANDCOVER_LAYER,
} from 'constants/layers-slugs';

import GroupedListComponent from './grouped-list-component';

const mockGetXYZLayerByURL = vi.fn();
const mockGetFeatureLayer = vi.fn();
const mockGetFeaturePrivateOccurenceLayer = vi.fn();
const mockGetTileLayer = vi.fn();
const mockGetMVTSource = vi.fn();
const mockAddProtectedAreaLayer = vi.fn();
const vectorTileLayerSpy = vi.fn();
const tileLayerSpy = vi.fn();

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('@mui/material/Checkbox', () => ({
  default: ({ checked, indeterminate, onChange, onClick }) => (
    <input
      type="checkbox"
      aria-label="checkbox"
      checked={checked}
      data-indeterminate={indeterminate ? 'true' : 'false'}
      onChange={onChange || onClick || (() => {})}
      onClick={onClick}
      readOnly={false}
    />
  ),
}));

vi.mock('@mui/material/FormControlLabel', () => ({
  default: ({ control, label, style }) => (
    <label style={style}>
      {control}
      <span>{label}</span>
    </label>
  ),
}));

vi.mock('components/toggle-layer-info', () => ({
  default: ({ layer }) => <span data-testid={`layer-info-${layer.id}`} />,
}));

vi.mock('services/esri-feature-service', () => ({
  default: {
    getXYZLayerByURL: (...args) => mockGetXYZLayerByURL(...args),
    getFeatureLayer: (...args) => mockGetFeatureLayer(...args),
    getFeaturePrivateOccurenceLayer: (...args) =>
      mockGetFeaturePrivateOccurenceLayer(...args),
    getTileLayer: (...args) => mockGetTileLayer(...args),
    getMVTSource: (...args) => mockGetMVTSource(...args),
    addProtectedAreaLayer: (...args) => mockAddProtectedAreaLayer(...args),
  },
}));

vi.mock('@arcgis/core/layers/VectorTileLayer', () => ({
  default: function VectorTileLayer(config) {
    vectorTileLayerSpy(config);
    return {
      ...config,
      id: config.id,
      renderer: { symbol: { color: { r: 1, g: 2, b: 3, a: 1 } } },
    };
  },
}));

vi.mock('@arcgis/core/layers/TileLayer', () => ({
  default: function TileLayer(config) {
    tileLayerSpy(config);
    return {
      ...config,
      id: config.id,
      renderer: { symbol: { color: { r: 2, g: 3, b: 4, a: 1 } } },
    };
  },
}));

vi.mock('icons/arrow_right.svg?react', () => ({
  default: (props) => <svg data-testid="arrow-icon" {...props} />,
}));

const buildLayer = (id) => ({
  id,
  renderer: { symbol: { color: { r: 10, g: 20, b: 30, a: 1 } } },
});

const renderComponent = (overrideProps = {}) => {
  const map = {
    add: vi.fn(),
    remove: vi.fn(),
    addSource: vi.fn(),
    layers: { items: [] },
  };

  const view = {
    whenLayerView: vi.fn(() =>
      Promise.resolve({
        watch: vi.fn((_, callback) => callback(false)),
      })
    ),
  };

  const props = {
    dataPoints: [],
    countryISO: 'GUY',
    setDataPoints: vi.fn(),
    map,
    view,
    speciesInfo: { scientificname: 'Ateles paniscus', taxa: 'MAMMALS' },
    regionLayers: {},
    setRegionLayers: vi.fn((updater) =>
      typeof updater === 'function' ? updater({}) : updater
    ),
    setShowHabitatChart: vi.fn(),
    setIsHabitatChartLoading: vi.fn(),
    isPrivate: false,
    setMapLegendLayers: vi.fn((updater) =>
      typeof updater === 'function' ? updater([]) : updater
    ),
    showHabitatLayer: false,
    showPredictionMap: false,
    setIsLoading: vi.fn(),
    mapData: { prediction_map: { tile_url: 'prediction' } },
    ...overrideProps,
  };

  const result = render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <GroupedListComponent {...props} />
    </LightModeContext.Provider>
  );

  return { ...result, props, map, view };
};

describe('GroupedListComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetXYZLayerByURL.mockResolvedValue(buildLayer('xyz-layer'));
    mockGetFeatureLayer.mockResolvedValue(buildLayer('feature-layer'));
    mockGetFeaturePrivateOccurenceLayer.mockResolvedValue(
      buildLayer('private-layer')
    );
    mockGetTileLayer.mockResolvedValue(buildLayer('tile-layer'));
    mockGetMVTSource.mockResolvedValue(buildLayer('mvt-source'));
    mockAddProtectedAreaLayer.mockResolvedValue(buildLayer('protected-layer'));
  });

  it('toggles children visibility and marks parent checkbox indeterminate', () => {
    const parent = {
      label: 'Expert range maps',
      id: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
      total_no_rows: 2,
      showChildren: false,
      hideInfo: true,
      items: [
        {
          dataset_id: 'ec694c34-bddd-4111-ba99-926a5f7866e8',
          dataset_title: 'Dataset 1',
          type_title: LAYER_TITLE_TYPES.EXPERT_RANGE_MAPS,
          isActive: true,
          parentId: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
        },
        {
          dataset_id: '0ed89f4f-3ed2-41c2-9792-7c7314a55455',
          dataset_title: 'Dataset 2',
          type_title: LAYER_TITLE_TYPES.EXPERT_RANGE_MAPS,
          isActive: false,
          parentId: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
        },
      ],
    };

    const { props } = renderComponent({ dataPoints: [parent] });

    const parentCheckbox = screen.getByLabelText('checkbox');
    expect(parentCheckbox.getAttribute('data-indeterminate')).toBe('true');

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle children visibility' })
    );

    expect(props.setDataPoints).toHaveBeenCalledWith([
      expect.objectContaining({ showChildren: true }),
    ]);
  });

  it('adds and removes expert range layers', async () => {
    const item = {
      dataset_id: 'ec694c34-bddd-4111-ba99-926a5f7866e8',
      dataset_title: 'MDD Mammals 2021',
      type_title: LAYER_TITLE_TYPES.EXPERT_RANGE_MAPS,
      isActive: false,
      parentId: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
      id: 'child-1',
    };
    const map = {
      add: vi.fn(),
      remove: vi.fn(),
      addSource: vi.fn(),
      layers: { items: [{ id: 'GBIF LAYER' }, { id: 'EBIRD LAYER' }] },
    };
    const { rerender, props } = renderComponent({
      map,
      dataPoints: [
        {
          label: 'Expert range maps',
          id: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
          total_no_rows: 1,
          showChildren: true,
          items: [item],
        },
      ],
    });

    fireEvent.click(screen.getByText('MDD Mammals 2021').previousSibling);

    await waitFor(() => {
      expect(mockGetXYZLayerByURL).toHaveBeenCalled();
      expect(map.add).toHaveBeenCalled();
      expect(props.setRegionLayers).toHaveBeenCalled();
      expect(props.setMapLegendLayers).toHaveBeenCalled();
    });

    const activeItem = { ...item, isActive: true };
    map.layers.items = [{ id: 'MDD MAMMALS 2021' }];

    rerender(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <GroupedListComponent
          {...props}
          map={map}
          regionLayers={{ 'MDD MAMMALS 2021': buildLayer('MDD MAMMALS 2021') }}
          dataPoints={[
            {
              label: 'Expert range maps',
              id: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
              total_no_rows: 1,
              showChildren: true,
              items: [activeItem],
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    fireEvent.click(screen.getByText('MDD Mammals 2021').previousSibling);

    await waitFor(() => {
      expect(map.remove).toHaveBeenCalled();
      expect(props.setMapLegendLayers).toHaveBeenCalled();
    });
  });

  it('toggles habitat layer and enables habitat chart when loading completes', async () => {
    mockGetXYZLayerByURL.mockResolvedValue(buildLayer(LAYER_OPTIONS.HABITAT));

    const { props, map } = renderComponent({
      dataPoints: [
        {
          label: 'Habitat Loss/Gain',
          items: [],
          id: LAYER_OPTIONS.HABITAT,
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        },
      ],
    });

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(mockGetXYZLayerByURL).toHaveBeenCalledWith(
        props.mapData,
        LAYER_OPTIONS.HABITAT,
        LAYER_TITLE_TYPES.TREND
      );
      expect(props.setIsHabitatChartLoading).toHaveBeenCalledWith(true);
      expect(props.setShowHabitatChart).toHaveBeenCalledWith(true);
      expect(map.add).toHaveBeenCalled();
    });
  });

  it('creates a vector tile layer for public point observations', async () => {
    const pointItem = {
      dataset_id: '9905692e-6a28-4310-b01e-476a471e5bf8',
      dataset_title: 'GBIF',
      type_title: LAYER_TITLE_TYPES.POINT_OBSERVATIONS,
      isActive: false,
      parentId: LAYER_OPTIONS.POINT_OBSERVATIONS,
      id: 'point-1',
      no_rows: 4,
    };

    const { map, props } = renderComponent({
      dataPoints: [
        {
          label: 'Point observations',
          id: LAYER_OPTIONS.POINT_OBSERVATIONS,
          total_no_rows: 4,
          showChildren: true,
          items: [pointItem],
        },
      ],
    });

    fireEvent.click(screen.getByText('GBIF').previousSibling);

    await waitFor(() => {
      expect(vectorTileLayerSpy).toHaveBeenCalled();
      expect(map.add).toHaveBeenCalled();
      expect(props.setRegionLayers).toHaveBeenCalled();
      expect(props.setMapLegendLayers).toHaveBeenCalled();
    });
  });

  it('uses the private occurrence service for private datasets', async () => {
    const privateItem = {
      dataset_id: 'private-dataset',
      dataset_title: 'Private study',
      type_title: LAYER_TITLE_TYPES.POINT_OBSERVATIONS,
      type: 'PRIVATE',
      isActive: false,
      parentId: LAYER_OPTIONS.POINT_OBSERVATIONS,
      id: 'private-1',
    };

    renderComponent({
      dataPoints: [
        {
          label: 'Point observations',
          id: LAYER_OPTIONS.POINT_OBSERVATIONS,
          total_no_rows: 1,
          showChildren: true,
          items: [privateItem],
        },
      ],
      isPrivate: true,
      countryISO: 'GIN',
    });

    fireEvent.click(screen.getByText('Private study').previousSibling);

    await waitFor(() => {
      expect(mockGetFeaturePrivateOccurenceLayer).toHaveBeenCalledWith(
        '34e596f26f3b4203937e872e91c630b1',
        'Ateles paniscus',
        'PRIVATE STUDY',
        'Private study'
      );
    });
  });

  it('auto-activates prediction maps when requested', async () => {
    renderComponent({
      showPredictionMap: true,
      dataPoints: [],
    });

    await waitFor(() => {
      expect(mockGetXYZLayerByURL).toHaveBeenCalledWith(
        { prediction_map: { tile_url: 'prediction' } },
        LAYER_OPTIONS.PREDICTION_MAPS,
        LAYER_TITLE_TYPES.PREDICTION_MAPS
      );
    });
  });

  it('supports the Peru prediction-map effect label branch', async () => {
    renderComponent({
      countryISO: 'PER',
      showPredictionMap: true,
      dataPoints: [],
    });

    await waitFor(() => {
      expect(mockGetXYZLayerByURL).toHaveBeenCalledWith(
        { prediction_map: { tile_url: 'prediction' } },
        LAYER_OPTIONS.PREDICTION_MAPS,
        LAYER_TITLE_TYPES.PREDICTION_MAPS
      );
    });
  });

  it('does not activate defaults when map data is missing', async () => {
    renderComponent({
      mapData: null,
      dataPoints: [
        {
          label: 'Expert range maps',
          id: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
          total_no_rows: 1,
          isActive: true,
          showChildren: false,
          items: [
            {
              dataset_id: 'ec694c34-bddd-4111-ba99-926a5f7866e8',
              dataset_title: 'Default layer',
              type_title: LAYER_TITLE_TYPES.EXPERT_RANGE_MAPS,
              isActive: true,
              parentId: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
              id: 'default-child',
            },
          ],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Expert range maps')).toBeInTheDocument();
    });

    expect(mockGetXYZLayerByURL).not.toHaveBeenCalled();
  });

  it('does not activate defaults when the map is unavailable', async () => {
    renderComponent({
      map: null,
      dataPoints: [
        {
          label: 'Expert range maps',
          id: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
          total_no_rows: 1,
          isActive: true,
          showChildren: false,
          items: [
            {
              dataset_id: 'ec694c34-bddd-4111-ba99-926a5f7866e8',
              dataset_title: 'Default layer',
              type_title: LAYER_TITLE_TYPES.EXPERT_RANGE_MAPS,
              isActive: true,
              parentId: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
              id: 'default-child',
            },
          ],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Expert range maps')).toBeInTheDocument();
    });

    expect(mockGetXYZLayerByURL).not.toHaveBeenCalled();
  });

  it('adds regional checklist layers and map sources', async () => {
    const checklistItem = {
      dataset_id: 'checklist-1',
      dataset_title: 'Regional checklist',
      type_title: LAYER_TITLE_TYPES.REGIONAL_CHECKLISTS,
      isActive: false,
      parentId: 'CHECKLIST_PARENT',
      id: 'checklist-1',
      no_rows: 1,
    };

    const { map, props } = renderComponent({
      dataPoints: [
        {
          label: 'Regional checklists',
          id: 'CHECKLIST_PARENT',
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          items: [checklistItem],
        },
      ],
    });

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(mockGetMVTSource).toHaveBeenCalled();
      expect(map.addSource).toHaveBeenCalledWith(
        'mapTiles',
        expect.objectContaining({ type: 'vector' })
      );
      expect(map.add).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'mvt-fill' })
      );
      expect(props.setRegionLayers).toHaveBeenCalled();
    });
  });

  it('activates default checked layers when map data arrives', async () => {
    renderComponent({
      dataPoints: [
        {
          label: 'Expert range maps',
          id: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
          total_no_rows: 1,
          isActive: true,
          showChildren: false,
          items: [
            {
              dataset_id: 'ec694c34-bddd-4111-ba99-926a5f7866e8',
              dataset_title: 'Default layer',
              type_title: LAYER_TITLE_TYPES.EXPERT_RANGE_MAPS,
              isActive: true,
              parentId: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
              id: 'default-child',
            },
          ],
        },
      ],
    });

    await waitFor(() => {
      expect(mockGetXYZLayerByURL).toHaveBeenCalledWith(
        { prediction_map: { tile_url: 'prediction' } },
        expect.any(String),
        LAYER_TITLE_TYPES.EXPERT_RANGE_MAPS
      );
    });
  });

  it('adds and removes administrative layers for single-layer rows', async () => {
    const { rerender, props, map } = renderComponent({
      dataPoints: [
        {
          label: 'Administrative Layers',
          items: [],
          id: LAYER_OPTIONS.ADMINISTRATIVE_LAYERS,
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        },
      ],
    });

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(mockGetFeatureLayer).toHaveBeenCalledWith(
        expect.anything(),
        'GUY',
        LAYER_OPTIONS.ADMINISTRATIVE_LAYERS
      );
      expect(map.add).toHaveBeenCalled();
      expect(props.setRegionLayers).toHaveBeenCalled();
    });

    rerender(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <GroupedListComponent
          {...props}
          map={map}
          dataPoints={[
            {
              label: 'Administrative Layers',
              items: [],
              id: LAYER_OPTIONS.ADMINISTRATIVE_LAYERS,
              total_no_rows: 1,
              isActive: true,
              showChildren: false,
              type: DATA_POINT_TYPE.PUBLIC,
            },
          ]}
          regionLayers={{
            [LAYER_OPTIONS.ADMINISTRATIVE_LAYERS]: buildLayer('admin-layer'),
          }}
        />
      </LightModeContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(map.remove).toHaveBeenCalled();
    });
  });

  it('loads the EEWWF country lines feature layer', async () => {
    const { props } = renderComponent({
      dataPoints: [
        {
          label: 'EEWWF country lines',
          items: [],
          id: LAYER_OPTIONS.EEWWF_COUNTRY_LINES,
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        },
      ],
    });

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(props.map.add).toHaveBeenCalled();
      expect(props.setRegionLayers).toHaveBeenCalled();
    });
  });

  it('loads SDM tile layer when SDM row is toggled', async () => {
    renderComponent({
      dataPoints: [
        {
          label: 'SDM layer',
          items: [],
          id: LAYER_OPTIONS.SDM,
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        },
      ],
    });

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(mockGetTileLayer).toHaveBeenCalledWith(
        DASHBOARD_URLS.SDM_FEATURE_LAYER_URL,
        LAYER_OPTIONS.SDM
      );
    });
  });

  it('loads protected areas for single-layer rows', async () => {
    renderComponent({
      dataPoints: [
        {
          label: 'Protected Areas',
          items: [],
          id: LAYER_OPTIONS.PROTECTED_AREAS,
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        },
      ],
    });

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(mockAddProtectedAreaLayer).toHaveBeenCalledWith(null, 'GUY');
    });
  });

  it('loads indigenous lands for single-layer rows', async () => {
    renderComponent({
      dataPoints: [
        {
          label: 'Indigenous Lands',
          items: [],
          id: LAYER_OPTIONS.INDIGENOUS_LANDS,
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        },
      ],
    });

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(mockGetFeatureLayer).toHaveBeenCalledWith(
        INDIGENOUS_LANDS_FEATURE_ID,
        'GUY',
        LAYER_OPTIONS.INDIGENOUS_LANDS
      );
    });
  });

  it('loads Peru crops and Apurimac landcover layers through specific feature ids', async () => {
    const { rerender, props } = renderComponent({
      countryISO: 'PER',
      dataPoints: [
        {
          label: 'Peru crops',
          items: [],
          id: PERU_CROPS_LAYER,
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        },
      ],
    });

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(mockGetFeatureLayer).toHaveBeenCalledWith(
        PERU_CROPS_FEATURE_ID,
        'PER',
        PERU_CROPS_LAYER,
        'PER_LAYER'
      );
    });

    rerender(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <GroupedListComponent
          {...props}
          countryISO="PER"
          dataPoints={[
            {
              label: 'Apurimac landcover',
              items: [],
              id: APURIMAC_LANDCOVER_LAYER,
              total_no_rows: 1,
              isActive: false,
              showChildren: false,
              type: DATA_POINT_TYPE.PUBLIC,
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('checkbox'));

    await waitFor(() => {
      expect(mockGetFeatureLayer).toHaveBeenCalledWith(
        APURIMAC_LANDCOVER_FEATURE_ID,
        'PER',
        APURIMAC_LANDCOVER_LAYER,
        'APURIMAC_LANDCOVER_LAYER'
      );
    });
  });

  it('uses the COD private portal id for private observations', async () => {
    const privateItem = {
      dataset_id: 'private-dataset',
      dataset_title: 'Private COD',
      type_title: LAYER_TITLE_TYPES.POINT_OBSERVATIONS,
      type: 'PRIVATE',
      isActive: false,
      parentId: LAYER_OPTIONS.POINT_OBSERVATIONS,
      id: 'private-cod',
    };

    renderComponent({
      dataPoints: [
        {
          label: 'Point observations',
          id: LAYER_OPTIONS.POINT_OBSERVATIONS,
          total_no_rows: 1,
          showChildren: true,
          items: [privateItem],
        },
      ],
      isPrivate: true,
      countryISO: 'COD',
    });

    fireEvent.click(screen.getByText('Private COD').previousSibling);

    await waitFor(() => {
      expect(mockGetFeaturePrivateOccurenceLayer).toHaveBeenCalledWith(
        '34e596f26f3b4203937e872e91c630b1',
        'Ateles paniscus',
        'PRIVATE COD',
        'Private COD'
      );
    });
  });

  it('inserts prediction maps before GBIF or eBird layers when present', async () => {
    const mapWithGbif = {
      add: vi.fn(),
      remove: vi.fn(),
      addSource: vi.fn(),
      layers: { items: [{ id: 'gbif-observations' }] },
    };

    renderComponent({
      map: mapWithGbif,
      showPredictionMap: true,
      dataPoints: [],
    });

    await waitFor(() => {
      expect(mapWithGbif.add).toHaveBeenCalledWith(expect.anything(), 0);
    });

    const mapWithEbird = {
      add: vi.fn(),
      remove: vi.fn(),
      addSource: vi.fn(),
      layers: { items: [{ id: 'ebird-observations' }] },
    };

    renderComponent({
      map: mapWithEbird,
      showPredictionMap: true,
      dataPoints: [],
    });

    await waitFor(() => {
      expect(mapWithEbird.add).toHaveBeenCalledWith(expect.anything(), 0);
    });
  });
});
