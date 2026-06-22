import React, { useRef } from 'react';
import PlanningComponent from './planning-component';
import { DASHBOARD_URLS } from 'constants/layers-urls.js';
import EsriFeatureService from 'services/esri-feature-service';

export const defaultPlanningOptions = [
  { id: 'species', value: 0, label: 'Species', checked: false },
  { id: 'ecosystem', value: 0, label: 'Ecosystem', checked: false },
  { id: 'carbon', value: 0, label: 'Carbon', checked: false },
  { id: 'water', value: 0, label: 'Water', checked: false },
  { id: 'ecotourism', value: 0, label: 'Ecotourism', checked: false },
];

function PlanningContainer({ map }) {
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

  const updateValue = async (option, value) => {
    const sample_priority_layer = map.layers.items.find(
      (item) => item.id === 'sample_priority_layer'
    );

    ecoValue.current = option.label === 'Ecotourism' ? value : ecoValue.current;
    speciesValue.current =
      option.label === 'Species' ? value : speciesValue.current;

    setPlanningOptions((prevOptions) =>
      prevOptions.map((opt) =>
        opt.label === option.label ? { ...opt, value } : opt
      )
    );

    if (ecoValue.current >= 0.5 && speciesValue.current >= 0.5) {
      const layer = await EsriFeatureService.getTileLayer(
        DASHBOARD_URLS.SAMPLE_PRIORITY_LAYER,
        'sample_priority_layer'
      );

      if (!sample_priority_layer) {
        map.add(layer);
      }
    } else {
      if (sample_priority_layer) {
        map.remove(sample_priority_layer);
      }
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
