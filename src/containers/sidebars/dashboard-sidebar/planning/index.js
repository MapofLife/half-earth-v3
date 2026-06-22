import React, { useRef } from 'react';
import PlanningComponent from './planning-component';

export const defaultPlanningOptions = [
  { id: 'species', value: 0, label: 'Species', checked: false },
  { id: 'ecosystem', value: 0, label: 'Ecosystem', checked: false },
  { id: 'carbon', value: 0, label: 'Carbon', checked: false },
  { id: 'water', value: 0, label: 'Water', checked: false },
  { id: 'ecotourism', value: 0, label: 'Ecotourism', checked: false },
];

function PlanningContainer() {
  const ecoValue = useRef(0);
  const speciesValue = useRef(0);
  const [planningOptions, setPlanningOptions] = React.useState(
    defaultPlanningOptions
  );
  const [maximumArea, setMaximumArea] = React.useState(0);

  const displaySlider = (option, value, checked) => {
    // Update the checked status of the planning option
    setPlanningOptions((prevOptions) =>
      prevOptions.map((opt) =>
        opt.label === option.label ? { ...opt, checked } : opt
      )
    );
  };

  const updateValue = (option, value) => {
    // Update the planning option value
    console.log(`Updating ${option.label} to value: ${value}`);

    ecoValue.current = option.label === 'Ecotourism' ? value : ecoValue.current;
    speciesValue.current =
      option.label === 'Species' ? value : speciesValue.current;

    setPlanningOptions((prevOptions) =>
      prevOptions.map((opt) =>
        opt.label === option.label ? { ...opt, value } : opt
      )
    );

    if (ecoValue.current >= 0.5 && speciesValue.current >= 0.5) {
      console.log('Show layer');
    }
  };

  return (
    <PlanningComponent
      options={planningOptions}
      displaySlider={displaySlider}
      updateValue={updateValue}
      maximumArea={maximumArea}
      setMaximumArea={setMaximumArea}
    />
  );
}

export default PlanningContainer;
