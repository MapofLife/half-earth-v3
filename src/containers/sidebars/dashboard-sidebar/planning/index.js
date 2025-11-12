import React from 'react'
import PlanningComponent from './planning-component'

export const defaultPlanningOptions = [
  { value: 0, label: 'Species', checked: false },
  { value: 0, label: 'Ecosystem', checked: false },
  { value: 0, label: 'Carbon', checked: false },
  { value: 0, label: 'Water', checked: false },
  { value: 0, label: 'Ecotourism', checked: false },
];

function PlanningContainer() {
  const [planningOptions, setPlanningOptions] = React.useState(defaultPlanningOptions);
  const [maximumArea, setMaximumArea] = React.useState(0);

  const displaySlider = (option, value, checked) => {
    // Update the checked status of the planning option
    setPlanningOptions(prevOptions =>
      prevOptions.map(opt =>
        opt.label === option.label ? { ...opt, checked } : opt
      )
    );
  }

  const updateValue = (option, value) => {
    // Update the planning option value
    console.log(`Updating ${option.label} to value: ${value}`);

    setPlanningOptions(prevOptions =>
      prevOptions.map(opt =>
        opt.label === option.label ? { ...opt, value } : opt
      )
    );
  }

  return (
    <PlanningComponent
      options={planningOptions}
      displaySlider={displaySlider}
      updateValue={updateValue}
      maximumArea={maximumArea}
      setMaximumArea={setMaximumArea}
    />
  )
}

export default PlanningContainer
