import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  TABS,
  default as DashboardTrendsSidebar,
} from './dashboard-trends-sidebar-component';
import { REGION_OPTIONS } from 'constants/dashboard-constants';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('./shi', () => ({
  default: () => <div data-testid="shi-panel" />,
}));
vi.mock('./spi', () => ({
  default: () => <div data-testid="spi-panel" />,
}));
vi.mock('./sii', () => ({
  default: () => <div data-testid="sii-panel" />,
}));

function makeLayer(id, visible = true) {
  return { id, visible };
}

function getMap(countryISO = 'PER') {
  return {
    layers: {
      items: [
        makeLayer(REGION_OPTIONS.PROVINCES, true),
        makeLayer(`${countryISO}-spi`, true),
        makeLayer(`${countryISO}-spi-lnd`, true),
        makeLayer(`${countryISO}-spi-int`, true),
        makeLayer(`${countryISO}-shi`, false),
        makeLayer(`${countryISO}-shi-lnd`, true),
        makeLayer(`${countryISO}-shi-int`, true),
        makeLayer(`${countryISO}-zone5-spi`, true),
        makeLayer(`${countryISO}-zone5-shi`, true),
        makeLayer(`${countryISO}-zone3-spi`, true),
        makeLayer(`${countryISO}-zone3-shi`, true),
        makeLayer(`${countryISO}-outline`, true),
        makeLayer(`${countryISO}-sii`, false),
        makeLayer('GUY-RIVER', true),
        makeLayer('GUY-RIVER-NAME', true),
      ],
    },
  };
}

function renderComponent(overrides = {}) {
  const props = {
    shiValue: 10,
    siiValue: 20,
    spiValue: 30,
    tabOption: TABS.SPI,
    setTabOption: vi.fn(),
    regionLayers: { one: true },
    handleRegionSelected: vi.fn(),
    countryISO: 'PER',
    map: getMap('PER'),
    setMapLegendLayers: vi.fn(),
    ...overrides,
  };

  const rendered = render(<DashboardTrendsSidebar {...props} />);
  return { props, ...rendered };
}

describe('DashboardTrendsSidebar', () => {
  it('toggles visibility for SPI, SHI and SII tabs', () => {
    const { props } = renderComponent();

    fireEvent.click(screen.getByLabelText('Species Protection Index'));
    expect(props.handleRegionSelected).toHaveBeenCalledWith(null);
    expect(props.setTabOption).toHaveBeenCalledWith(TABS.SPI);
    expect(props.setMapLegendLayers).toHaveBeenCalledWith([
      { label: 'SPI', parent: '', id: REGION_OPTIONS.PROVINCES },
    ]);

    fireEvent.click(screen.getByLabelText('Species Habitat Index'));
    expect(props.setTabOption).toHaveBeenCalledWith(TABS.SHI);
    expect(props.setMapLegendLayers).toHaveBeenCalledWith([
      { label: 'SHI', parent: '', id: 'PER-outline' },
    ]);

    fireEvent.click(screen.getByLabelText('Species Information Index'));
    expect(props.setTabOption).toHaveBeenCalledWith(TABS.SII);
    expect(props.setMapLegendLayers).toHaveBeenCalledWith([
      { label: 'SII', parent: '', id: 'PER-sii' },
    ]);
  });

  it('clears legends for EE countries', () => {
    const { props } = renderComponent({
      countryISO: 'EE',
      map: getMap('EE'),
    });

    fireEvent.click(screen.getByLabelText('Species Habitat Index'));
    expect(props.setMapLegendLayers).toHaveBeenLastCalledWith([]);
  });

  it('hides GUY river layers on mount and restores on unmount', () => {
    const map = getMap('PER');

    const { unmount } = renderComponent({ map });

    expect(map.layers.items.find((i) => i.id === 'GUY-RIVER').visible).toBe(
      false
    );
    expect(
      map.layers.items.find((i) => i.id === 'GUY-RIVER-NAME').visible
    ).toBe(false);

    unmount();

    expect(map.layers.items.find((i) => i.id === 'GUY-RIVER').visible).toBe(
      true
    );
    expect(
      map.layers.items.find((i) => i.id === 'GUY-RIVER-NAME').visible
    ).toBe(true);
  });

  it('renders the right tab panel', () => {
    const { rerender } = renderComponent({ tabOption: TABS.SPI });
    expect(screen.getByTestId('spi-panel')).toBeInTheDocument();

    rerender(
      <DashboardTrendsSidebar
        shiValue={1}
        siiValue={2}
        spiValue={3}
        tabOption={TABS.SHI}
        setTabOption={vi.fn()}
        regionLayers={{}}
        handleRegionSelected={vi.fn()}
        countryISO="PER"
        map={getMap('PER')}
        setMapLegendLayers={vi.fn()}
      />
    );
    expect(screen.getByTestId('shi-panel')).toBeInTheDocument();

    rerender(
      <DashboardTrendsSidebar
        shiValue={1}
        siiValue={2}
        spiValue={3}
        tabOption={TABS.SII}
        setTabOption={vi.fn()}
        regionLayers={{}}
        handleRegionSelected={vi.fn()}
        countryISO="PER"
        map={getMap('PER')}
        setMapLegendLayers={vi.fn()}
      />
    );
    expect(screen.getByTestId('sii-panel')).toBeInTheDocument();
  });
});
