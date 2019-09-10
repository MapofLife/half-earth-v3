
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import setSpeciesActions from 'redux_modules/species';
import SpeciesWidgetComponent from './species-widget-component';
import mapStateToProps from './species-widget-selectors';
import { loadModules } from '@esri/react-arcgis';
import * as urlActions from 'actions/url-actions';

const actions = { ...setSpeciesActions, ...urlActions };

const SpeciesWidget = ({ setSpecies, terrestrialCellData, data, changeGlobe, selectedSpeciesData }) => {
  const [speciesLayer, setLayer] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleSelectNextSpecies = () => {
    let newIndex;
    if(selectedIndex === data.length - 1) {
      newIndex = 0;
    } else {
      newIndex = selectedIndex + 1;
    }

    const { name } = data[newIndex];
    changeGlobe({ selectedSpecies: name });
    setSelectedIndex(newIndex);
    return ;
  }

  const handleSelectPrevSpecies = () => {
    let newIndex;
    if(selectedIndex === 0) {
      newIndex = data.length - 1;
    } else {
      newIndex = selectedIndex - 1;
    }

    const { name } = data[newIndex];
    changeGlobe({ selectedSpecies: name });
    setSelectedIndex(newIndex);
    return ;
  }

  const querySpeciesData = () => {
    const query = speciesLayer.createQuery();
    query.where = `HBWID IN (${terrestrialCellData.map(i => i.CELL_ID).join(', ')})`;
    query.outFields = [ "HBWID", "scntfcn", "taxa", "RANGE_A", "PROP_RA", "url_sp"];
    speciesLayer.queryFeatures(query).then(function(results){
      const { features } = results;
      setSpecies(features.map(c => c.attributes));
    });
  };

  const fetchSpeciesLayer = () => {
    loadModules(["esri/layers/FeatureLayer"]).then(([FeatureLayer]) => {
      const _speciesLayer = new FeatureLayer({
        // URL to the service
        url: "https://services9.arcgis.com/IkktFdUAcY3WrH25/arcgis/rest/services/TerrestrialVertebrateSpeciesSHP/FeatureServer",
      });
      setLayer(_speciesLayer)
    })
  };

  useEffect(() => {
    fetchSpeciesLayer()
  }, []);
 
  useEffect(() => {
    if (speciesLayer && terrestrialCellData) {
      querySpeciesData();
    }
  }, [speciesLayer, terrestrialCellData])

  useEffect(() => {
    if(data) {
      changeGlobe({ selectedSpecies: data[0] });
      setSelectedIndex(0);
    }
  }, [data]);

  return (
    <SpeciesWidgetComponent
      data={data}
      selectedSpecies={selectedSpeciesData}
      handleSelectNextSpecies={handleSelectNextSpecies}
      handleSelectPrevSpecies={handleSelectPrevSpecies}
    />
  );
}

export default connect(mapStateToProps, actions)(SpeciesWidget); 
