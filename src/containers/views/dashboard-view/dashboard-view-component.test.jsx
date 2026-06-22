import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { vi } from 'vitest';

import { NAVIGATION } from 'constants/dashboard-constants';
import DashboardViewComponent from './dashboard-view-component';

const mapViewMock = vi.fn();
const areaHighlightManagerMock = vi.fn(() => (
  <div data-testid="area-highlight-manager" />
));
const dashboardSidebarMock = vi.fn(() => (
  <div data-testid="dashboard-sidebar" />
));
const layerInfoModalMock = vi.fn(() => <div data-testid="layer-info-modal" />);
const mapLegendMock = vi.fn(() => <div data-testid="map-legend" />);
const layerLegendMock = vi.fn(() => <div data-testid="layer-legend" />);
const countryLabelsMock = vi.fn(() => <div data-testid="country-labels" />);
const regionLabelsMock = vi.fn(() => <div data-testid="region-labels" />);
const sideMenuMock = vi.fn(() => <div data-testid="side-menu" />);
const labelsLayerMock = vi.fn(() => <div data-testid="labels-layer" />);
const loadingMock = vi.fn(() => <div data-testid="loading" />);
const snackbarMock = vi.fn(({ open, message, onClose }) => (
  <div data-testid="snackbar" data-open={String(open)}>
    <span>{message}</span>
    <button type="button" onClick={onClose}>
      close snackbar
    </button>
  </div>
));

const shapefileReadMock = vi.fn();

vi.mock('@loadable/component', () => ({
  default: () => (props) => labelsLayerMock(props),
}));

vi.mock('components/map-view', () => ({
  default: (props) => {
    mapViewMock(props);
    return <div data-testid="map-view">{props.children}</div>;
  },
}));

vi.mock(
  'components/AreaHighlightManager/area-highlight-manager-component',
  () => ({
    default: (props) => areaHighlightManagerMock(props),
  })
);

vi.mock('containers/sidebars/dashboard-sidebar', () => ({
  default: (props) => dashboardSidebarMock(props),
}));

vi.mock('components/layer-info-modal', () => ({
  default: (props) => layerInfoModalMock(props),
}));

vi.mock('components/map-legend', () => ({
  default: (props) => mapLegendMock(props),
}));

vi.mock('../../../components/layer-legend', () => ({
  default: (props) => layerLegendMock(props),
}));

vi.mock('containers/layers/country-labels-layer', () => ({
  default: (props) => countryLabelsMock(props),
}));

vi.mock('containers/layers/regions-labels-layer', () => ({
  default: (props) => regionLabelsMock(props),
}));

vi.mock('containers/menus/sidemenu', () => ({
  default: (props) => sideMenuMock(props),
}));

vi.mock('he-components', () => ({
  Loading: (props) => loadingMock(props),
}));

vi.mock('@mui/material', () => ({
  Snackbar: (props) => snackbarMock(props),
}));

vi.mock('shapefile', () => ({
  read: (...args) => shapefileReadMock(...args),
}));

vi.mock(
  '../../sidebars/dashboard-trends-sidebar/dashboard-trends-sidebar-component',
  () => ({
    MEX: 'MEX',
    NATIONAL_TREND: 'NATIONAL',
    PROVINCE_TREND: 'PROVINCE',
    TERRISTRIAL: 'TERRESTRIAL',
    MARINE: 'MARINE',
  })
);

vi.mock('icons/closes.svg?react', () => ({
  default: () => <svg data-testid="close-icon" />,
}));

function createFileReaderMock() {
  class FileReaderMock {
    readAsText(file) {
      if (this.onload) {
        this.onload({ target: { result: file.mockContent } });
      }
    }

    readAsArrayBuffer(file) {
      if (this.onload) {
        this.onload({ target: { result: file.mockBuffer || 'buffer' } });
      }
    }
  }

  vi.stubGlobal('FileReader', FileReaderMock);
}

function baseProps(overrides = {}) {
  return {
    activeLayers: [{ id: 'active-1' }],
    onMapLoad: vi.fn(),
    sceneMode: 'data',
    viewSettings: { basemap: { layersArray: [] } },
    countryISO: 'PER',
    countryName: 'Peru',
    isFullscreenActive: false,
    openedModal: null,
    geometry: { type: 'polygon' },
    setSelectedIndex: vi.fn(),
    selectedIndex: NAVIGATION.HOME,
    setSelectedRegion: vi.fn(),
    selectedRegion: null,
    browsePage: vi.fn(),
    regionLayers: { region: true },
    setRegionLayers: vi.fn(),
    tabOption: 2,
    setSelectedProvince: vi.fn(),
    mapLegendLayers: [],
    regionName: 'Amazonas',
    setRegionName: vi.fn(),
    ...overrides,
  };
}

describe('DashboardViewComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createFileReaderMock();
    shapefileReadMock.mockResolvedValue({
      features: [{ id: 'shape-1' }, { id: 'shape-2' }],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('passes map props through to core child components', () => {
    const props = baseProps();

    render(<DashboardViewComponent {...props} />);

    expect(screen.getByTestId('map-view')).toBeInTheDocument();
    expect(mapViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mapName: 'dashboard',
        countryISO: 'PER',
        geometry: props.geometry,
      })
    );
    expect(countryLabelsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        countryISO: 'PER',
        countryName: 'Peru',
        activeLayers: props.activeLayers,
      })
    );
    expect(regionLabelsMock).toHaveBeenCalled();
    expect(sideMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        openedModal: null,
        activeLayers: props.activeLayers,
        isFullscreenActive: false,
      })
    );
    expect(labelsLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({ activeLayers: props.activeLayers })
    );
  });

  it('shows map legend when legend layers exist and layer legend for region tab', () => {
    render(
      <DashboardViewComponent
        {...baseProps({
          selectedIndex: NAVIGATION.REGION,
          mapLegendLayers: [{ id: 'legend-1' }],
        })}
      />
    );

    expect(mapLegendMock).toHaveBeenCalled();
    expect(layerLegendMock).toHaveBeenCalled();
  });

  it('wires sidebar callbacks for modal, loading, upload popup, hover, region highlight and snackbar', async () => {
    const removePreviousHighlight = vi.fn();
    const highlightNext = { remove: vi.fn() };

    dashboardSidebarMock.mockImplementationOnce((props) => {
      act(() => {
        props.setLayerInfo({ title: 'Layer details' });
        props.setIsLoading(true);
        props.setImagePopup(<div>Popup body</div>);
        props.setShowUploadPopup(true);
        props.setUploadedShape({ features: [{ id: 'manual-shape' }] });
        props.setSnackBar({ open: true, message: 'Saved' });
        props.setShowHover(false);
        props.handleRegionSelected({ graphic: { id: 'graphic-1' } });
      });
      return <div data-testid="dashboard-sidebar" />;
    });

    areaHighlightManagerMock.mockImplementationOnce((props) => {
      act(() => {
        props.setLayerView({
          highlight: vi.fn(() => highlightNext),
        });
      });
      return <div data-testid="area-highlight" />;
    });

    render(<DashboardViewComponent {...baseProps()} />);

    dashboardSidebarMock.mock.calls.at(-1)[0].handleRegionSelected({
      graphic: { id: 'graphic-2' },
    });
    highlightNext.remove = removePreviousHighlight;
    dashboardSidebarMock.mock.calls.at(-1)[0].handleRegionSelected({
      graphic: { id: 'graphic-3' },
    });

    expect(layerInfoModalMock).toHaveBeenCalledWith(
      expect.objectContaining({ layerInfo: { title: 'Layer details' } })
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Popup body')).toBeInTheDocument();
    expect(screen.getByText('Upload an Area')).toBeInTheDocument();
    expect(snackbarMock).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, message: 'Saved' })
    );
    expect(dashboardSidebarMock.mock.calls.at(-1)[0].uploadedShape).toEqual({
      features: [{ id: 'manual-shape' }],
    });
    expect(areaHighlightManagerMock.mock.calls[0][0].showHover).toBe(true);
    await waitFor(() => {
      expect(dashboardSidebarMock.mock.calls.at(-1)[0].showHover).toBe(false);
    });
    expect(removePreviousHighlight).toHaveBeenCalled();

    fireEvent.click(screen.getAllByLabelText('overlay')[0]);
    expect(screen.queryByText('Popup body')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close popup'));
    expect(screen.queryByText('Upload an Area')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('close snackbar'));
    await waitFor(() => {
      expect(snackbarMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ open: false, message: '' })
      );
    });
  });

  it('parses geojson uploads and truncates to the first feature', async () => {
    dashboardSidebarMock.mockImplementationOnce((props) => {
      act(() => {
        props.setShowUploadPopup(true);
      });
      return <div data-testid="dashboard-sidebar" />;
    });

    render(<DashboardViewComponent {...baseProps()} />);

    const file = {
      name: 'area.geojson',
      mockContent: JSON.stringify({
        features: [{ id: 1 }, { id: 2 }],
      }),
    };

    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(dashboardSidebarMock.mock.calls.at(-1)[0].uploadedShape).toEqual({
        features: [{ id: 1 }],
      });
    });
  });

  it('parses shapefile uploads and truncates to the first feature', async () => {
    dashboardSidebarMock.mockImplementationOnce((props) => {
      act(() => {
        props.setShowUploadPopup(true);
      });
      return <div data-testid="dashboard-sidebar" />;
    });

    render(<DashboardViewComponent {...baseProps()} />);

    const file = {
      name: 'area.shp',
      mockBuffer: 'shape-buffer',
    };

    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(shapefileReadMock).toHaveBeenCalledWith('shape-buffer');
      expect(dashboardSidebarMock.mock.calls.at(-1)[0].uploadedShape).toEqual({
        features: [{ id: 'shape-1' }],
      });
    });
  });

  it('handles popup close button and upload overlay keydown handlers', async () => {
    dashboardSidebarMock.mockImplementationOnce((props) => {
      act(() => {
        props.setImagePopup(<div>Inline popup</div>);
        props.setShowUploadPopup(true);
      });
      return <div data-testid="dashboard-sidebar" />;
    });

    render(<DashboardViewComponent {...baseProps()} />);

    fireEvent.click(screen.getAllByLabelText('Close popup')[0]);
    expect(screen.queryByText('Inline popup')).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText('overlay'));
    await waitFor(() => {
      expect(screen.queryByText('Upload an Area')).not.toBeInTheDocument();
    });
  });

  it('switches EE trends to MEX defaults and skips layer legend outside target tabs', async () => {
    render(
      <DashboardViewComponent
        {...baseProps({
          countryISO: 'EE',
          selectedIndex: NAVIGATION.HOME,
        })}
      />
    );

    expect(layerLegendMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(dashboardSidebarMock.mock.calls.at(-1)[0].activeTrend).toBe('MEX');
      expect(dashboardSidebarMock.mock.calls.at(-1)[0].shiActiveTrend).toBe(
        'MEX'
      );
    });
  });
});
