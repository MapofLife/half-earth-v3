import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { NAVIGATION } from 'constants/dashboard-constants';
import BioDiversityComponent from './biodiversity-indicators-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
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

vi.mock('./habitat', () => ({
  default: () => <div data-testid="habitat" />,
}));

vi.mock('./protection', () => ({
  default: () => <div data-testid="protection" />,
}));

describe('BioDiversityComponent', () => {
  it('renders loading state, handles back, and switches between habitat and protection states', () => {
    const setSelectedIndex = vi.fn();
    const setSelectedTab = vi.fn();
    const { rerender } = render(
      <BioDiversityComponent
        lightMode={false}
        selectedTab={2}
        setSelectedTab={setSelectedTab}
        habitatScore={20}
        habitatTableData={[]}
        globalHabitatScore={0}
        protectionScore={null}
        globalProtectionScore={0}
        protectionTableData={[]}
        protectionArea={0}
        speciesInfo={{ commonname: 'Jaguar', scientificname: 'Panthera onca' }}
        globalProtectionArea={0}
        selectedRegion={null}
        setSelectedIndex={setSelectedIndex}
      />
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.HOME);

    rerender(
      <BioDiversityComponent
        lightMode={false}
        selectedTab={1}
        setSelectedTab={setSelectedTab}
        habitatScore={20}
        habitatTableData={[]}
        globalHabitatScore={0}
        protectionScore={25}
        globalProtectionScore={0}
        protectionTableData={[]}
        protectionArea={0}
        speciesInfo={{ commonname: 'Jaguar', scientificname: 'Panthera onca' }}
        globalProtectionArea={0}
        selectedRegion={{}}
        setSelectedIndex={setSelectedIndex}
      />
    );

    expect(screen.getByTestId('habitat')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Species Protection Index' })
    );
    expect(setSelectedTab).toHaveBeenCalledWith(2);

    rerender(
      <BioDiversityComponent
        lightMode={false}
        selectedTab={2}
        setSelectedTab={setSelectedTab}
        habitatScore={20}
        habitatTableData={[]}
        globalHabitatScore={0}
        protectionScore={0}
        globalProtectionScore={0}
        protectionTableData={[]}
        protectionArea={0}
        speciesInfo={{ commonname: 'Jaguar', scientificname: 'Panthera onca' }}
        globalProtectionArea={0}
        selectedRegion={{}}
        setSelectedIndex={setSelectedIndex}
      />
    );

    expect(
      screen.getByText('No SPS data available for this species')
    ).toBeInTheDocument();

    rerender(
      <BioDiversityComponent
        lightMode={false}
        selectedTab={2}
        setSelectedTab={setSelectedTab}
        habitatScore={20}
        habitatTableData={[]}
        globalHabitatScore={0}
        protectionScore={10}
        globalProtectionScore={0}
        protectionTableData={[]}
        protectionArea={0}
        speciesInfo={{ commonname: 'Jaguar', scientificname: 'Panthera onca' }}
        globalProtectionArea={0}
        selectedRegion={{}}
        setSelectedIndex={setSelectedIndex}
      />
    );

    expect(screen.getByTestId('protection')).toBeInTheDocument();
  });

  it('goes back to explore species when a region is selected and hides habitat tab for zero habitat score', () => {
    const setSelectedIndex = vi.fn();

    render(
      <BioDiversityComponent
        lightMode={false}
        selectedTab={2}
        setSelectedTab={vi.fn()}
        habitatScore={0}
        habitatTableData={[]}
        globalHabitatScore={0}
        protectionScore={10}
        globalProtectionScore={0}
        protectionTableData={[]}
        protectionArea={0}
        speciesInfo={{ commonname: 'Jaguar', scientificname: 'Panthera onca' }}
        globalProtectionArea={0}
        selectedRegion={{ id: 'region-1' }}
        setSelectedIndex={setSelectedIndex}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.EXPLORE_SPECIES);
    expect(
      screen.queryByRole('button', { name: 'Species Habitat Index' })
    ).not.toBeInTheDocument();
  });
});
