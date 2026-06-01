import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import PlanningComponent from './planning-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('@mui/material/FormControlLabel', () => ({
  default: ({ label, control }) => (
    <label>
      <span>{label}</span>
      {control}
    </label>
  ),
}));

vi.mock('@mui/material/Checkbox', () => ({
  default: ({ checked, onChange, name }) => (
    <input
      type="checkbox"
      aria-label={name}
      checked={checked}
      onChange={(event) => onChange(event)}
    />
  ),
}));

vi.mock('@mui/material', () => ({
  Slider: ({ title, value, onChange }) => (
    <input
      type="range"
      aria-label={title}
      value={value}
      onChange={(event) => onChange(event, Number(event.target.value))}
    />
  ),
}));

describe('PlanningComponent', () => {
  it('renders planning options and forwards checkbox and slider changes', () => {
    const displaySlider = vi.fn();
    const updateValue = vi.fn();
    const setMaximumArea = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <PlanningComponent
          options={[
            { label: 'Option A', checked: false, value: 0.25 },
            { label: 'Option B', checked: true, value: 0.5 },
          ]}
          updateValue={updateValue}
          displaySlider={displaySlider}
          maximumArea={0.75}
          setMaximumArea={setMaximumArea}
        />
      </LightModeContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Option A'));
    expect(displaySlider).toHaveBeenCalled();

    fireEvent.change(screen.getAllByLabelText('Option B')[1], {
      target: { value: '0.25' },
    });
    expect(updateValue).toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Maximum Area'), {
      target: { value: '0.33' },
    });
    expect(setMaximumArea).toHaveBeenCalledWith(0.33);
  });

  it('does not render option sliders when no options are checked', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <PlanningComponent
          options={[{ label: 'Option A', checked: false, value: 0.25 }]}
          updateValue={vi.fn()}
          displaySlider={vi.fn()}
          maximumArea={0.75}
          setMaximumArea={vi.fn()}
        />
      </LightModeContext.Provider>
    );

    expect(screen.queryByLabelText('Option A')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum Area')).toBeInTheDocument();
    expect(screen.getAllByRole('slider')).toHaveLength(1);
  });
});
