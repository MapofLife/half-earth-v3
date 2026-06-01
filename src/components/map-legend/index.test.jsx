import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import MapLegendContainer from './index';

const mapLegendComponentMock = vi.fn(({ title, count }) => (
  <div data-testid="map-legend-component">
    {title}:{count}
  </div>
));

vi.mock('./map-legend-component', () => ({
  default: (props) => mapLegendComponentMock(props),
}));

describe('MapLegendContainer', () => {
  it('forwards props to the map legend component', () => {
    const props = {
      title: 'Legend',
      count: 3,
      mapLegendLayers: [{ id: 'layer-1' }],
      setMapLegendLayers: vi.fn(),
    };

    render(<MapLegendContainer {...props} />);

    expect(screen.getByTestId('map-legend-component')).toHaveTextContent(
      'Legend:3'
    );
    expect(mapLegendComponentMock).toHaveBeenCalledWith(props);
  });
});
