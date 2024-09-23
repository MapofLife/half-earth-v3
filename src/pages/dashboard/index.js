import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { activateLayersOnLoad } from 'utils/layer-manager-utils';
import EsriFeatureService from 'services/esri-feature-service';
import { layersConfig } from 'constants/mol-layers-configs';

import { setBasemap } from '../../utils/layer-manager-utils.js';
import * as urlActions from 'actions/url-actions';
import countryDataActions from 'redux_modules/country-data';
import DashboardComponent from './dashboard-component.jsx';
import mapStateToProps from './dashboard-selectors.js';

import {
  COUNTRIES_DATA_SERVICE_URL
} from 'constants/layers-urls';
import { NAVIGATION } from '../../utils/dashboard-utils.js';


const actions = { ...countryDataActions, ...urlActions };

function DashboardContainer(props) {
  const {
    viewSettings,
    countryISO,
    scientificName,
    setCountryDataLoading,
    setCountryDataReady,
    setCountryDataError,
  } = props;

  const [geometry, setGeometry] = useState(null);
  const [speciesInfo, setSpeciesInfo] = useState(null);
  const [data, setData] = useState(null);
  const [dataLayerData, setDataLayerData] = useState(null);
  const [taxaList, setTaxaList] = useState([])
  const [dataByCountry, setDataByCountry] = useState(null);
  const [selectedTaxa, setSelectedTaxa] = useState('');
  const [filteredTaxaList, setFilteredTaxaList] = useState();
  const [speciesName, setSpeciesName] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(NAVIGATION.HOME);

  const speciesListUrl = 'https://next-api-dot-api-2-x-dot-map-of-life.appspot.com/2.x/spatial/species/list';

  // Get Country information, allows to get country name
  useEffect(() => {
    setCountryDataLoading();
    EsriFeatureService.getFeatures({
      url: COUNTRIES_DATA_SERVICE_URL,
      whereClause: `GID_0 = '${countryISO}'`,
      returnGeometry: true,
    })
      .then((features) => {
        const { geometry } = features[0];

        setCountryDataReady(features);
        if (geometry) {
          setGeometry(geometry);
        }

      })
      .catch((error) => {
        setCountryDataError(error);
      });

      getSpeciesList();
  }, []);

  useEffect(() => {
    if(!scientificName) return;
    localStorage.setItem('selected_species', scientificName);
    setSpeciesName(scientificName);
  }, [scientificName])


  useEffect(() => {
    if(!speciesName) return;
    getSpeciesData();
    getDataLayersData();
    getData();
  }, [speciesName]);

  useEffect(() => {
    // Function to handle back navigation
    const handleBackButton = (event) => {
      // Implement custom behavior here
      setSelectedIndex(window.history.state?.selectedIndex ?? 1);
    };

    // Add event listener for popstate event
    window.addEventListener('popstate', handleBackButton);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);


  const getDataLayersData = async () => {
    const dataLayerParams = {
      scientificname: speciesName,
      group: 'movement'
    };
    const dparams = new URLSearchParams(dataLayerParams);
    const dataLayersURL = `https://dev-api.mol.org/2.x/species/datasets?${dparams}`;

    const apiCalls = [
      dataLayersURL
    ];

    const apiResponses = await Promise.all(apiCalls.map(async (url) => {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    }));

    const [dataLayersData] = apiResponses;

    setDataLayerData(dataLayersData);
  }

  const getData = async () => {
    const speciesPreferences = `https://next-api-dot-api-2-x-dot-map-of-life.appspot.com/2.x/species/habitat?scientificname=${speciesName}`;
    const res = await fetch(speciesPreferences);
    const ps = await res.json();
    // TODO: figure out what to do is ps.prefs are null
    const preferences = getPreferenceQuery(ps.prefs);
    const params = new URLSearchParams(preferences);

    // TODO: Some responses have no frag results
    const habitatTrendUrl = `https://next-api-dot-api-2-x-dot-map-of-life.appspot.com/2.x/species/indicators/habitat-trends/bycountry?scientificname=${speciesName}`;
    const reserveCoverageMetricsUrl = `https://next-api-dot-api-2-x-dot-map-of-life.appspot.com/2.x/species/indicators/reserve-coverage/metrics?scientificname=${speciesName}&${params}`;
    const habitatMetricesUrl = `https://next-api-dot-api-2-x-dot-map-of-life.appspot.com/2.x/species/indicators/habitat-distribution/metrics?scientificname=${speciesName}&${params}`;

    // const dataLayerParams = {
    //   scientificname: scientificName,
    //   group: 'movement'
    // };
    // const dparams = new URLSearchParams(dataLayerParams);
    // const dataLayersURL = `https://dev-api.mol.org/2.x/species/datasets?${dparams}`;

    const apiCalls = [
      habitatTrendUrl,
      reserveCoverageMetricsUrl,
      habitatMetricesUrl,
    ];

    const apiResponses = await Promise.all(apiCalls.map(async (url) => {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    }));

    const [habitatTrendData, reserveCoverageData, habitatMetricesData] = apiResponses;
    getDataByCountry(habitatTrendData);

    setData({habitatTrendData, reserveCoverageData, habitatMetricesData});
  }

  const getSpeciesList = async () => {
    // TODO: Use mol-country-attribute.json file to find MOL Region ID for ISO value
    const params = makeSpeciesListParams({
      region_id: '44b3bc0a-e617-4785-9123-7e6e5349b07d',
    });
    const response = await fetch(speciesListUrl, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    const data = await response.json();


    const seasons = [
      '',
      'Resident',
      'Breeding',
      'Non-breeding',
      'Passage',
      '',
    ];

    data.taxas.forEach(taxa => {
      const taxaDatasetSet = new Set();
      taxa.species.forEach(species => {
        const speciesDatasets = Object.keys(species.dataset);
        speciesDatasets.forEach(d => {
          taxaDatasetSet.add(d);
        });
        const speciesDataset2 = {};
        speciesDatasets.forEach(k => {
          speciesDataset2[data.datasets[k].dataset_id] =
            species.dataset[k];
        });
        species.datasetList = speciesDatasets.map(dsid => ({
          dataset_id: data.datasets[dsid].dataset_id,
          product_type: data.datasets[dsid].product_type,
          title: data.datasets[dsid].title,
          seasonality: species.dataset[dsid],
          seasonalityString: species.dataset[dsid]
            .map(s => (s === null ? 'Resident' : seasons[s]))
            .filter(s => s.length > 0)
            .join(', '),
        }));
        species.dataset = speciesDataset2;
      });
      taxa.datasets = {};
      Array.from(taxaDatasetSet).forEach((d) => {
        const ds = data.datasets[d];
        taxa.datasets[ds.dataset_id] = ds;
      });
    });

    const taxa = sortTaxaList(data.taxas);
    setTaxaList(taxa);
  }

  const makeSpeciesListParams = (args, summary = false) => {
    const params = {};
    params.lang = 'en';
    if (args.lat) {
      params.lat = args.lat.toString();
    }
    if (args.lng) {
      params.lng = args.lng.toString();
    }
    if (args.radius) {
      params.radius = args.radius.toString();
    }
    if (args.wkt) {
      params.wkt = args.wkt;
    }

    if (args.geojson) {
      params.geojson = args.geojson;
    }
    if (args.region_id) {
      params.region_id = args.region_id;
    }
    if (summary) {
      params.summary = 'true';
    }
    return params;
  }

  const getPreferenceQuery = (preferences) => {
    return {
      class: preferences.class,
      habitat: preferences.habitat,
      treecover_max: preferences.tree_cover_max.toString(),
      treecover_min: preferences.tree_cover_min.toString(),
      elev_max: preferences.elev_max.toString(),
      elev_min: preferences.elev_min.toString(),
      use_e: preferences.use_e.toString(),
      use_h: preferences.use_h.toString(),
      use_f: preferences.use_f.toString(),
    }
  }

  const getDataByCountry = (d) => {
    let countryData;

    // TODO: figure out what to do when no shs is returned
    if (d.shs) {
      countryData = d.shs.reduce((acc, obj) => {
        const key = obj.country;
        if (!acc[key]) {
          acc[key] = { shs: [], frag: [] };
        }
        acc[key].shs.push(obj);
        return acc;
      }, {});
    }

    if (d.frag) {

      countryData = d.frag.reduce((acc, obj) => {
        const key = obj.country;
        if (!acc[key]) {
          acc[key] = { shs: [], frag: [] };
        }

        acc[key].frag.push(obj);
        return acc;
      }, countryData || {});
    }

    setDataByCountry(countryData);
  }

  const sortTaxaList = (taxa) => {
    return taxa.sort((a, b) => {
      if (a.sortby < b.sortby) {
        return -1;
      }
      if (a.sortby > b.sortby) {
        return 1;
      }
      return 0;
    });
  }

  const getSpeciesData = async () => {
    const url = `https://next-api-dot-api-2-x-dot-map-of-life.appspot.com/2.x/species/info?lang=en&scientificname=${speciesName}`;
    const response = await fetch(url);
    const data = await response.json();
    setSpeciesInfo(data[0]);
  }

  const handleMapLoad = (map, activeLayers) => {
    setBasemap({
      map,
      layersArray: viewSettings.basemap.layersArray,
    });
    activateLayersOnLoad(map, activeLayers, layersConfig);
  };

  return <DashboardComponent
    handleMapLoad={handleMapLoad}
    geometry={geometry}
    speciesInfo={speciesInfo}
    data={data}
    dataLayerData={dataLayerData}
    dataByCountry={dataByCountry}
    taxaList={taxaList}
    selectedTaxa={selectedTaxa}
    setSelectedTaxa={setSelectedTaxa}
    filteredTaxaList={filteredTaxaList}
    setFilteredTaxaList={setFilteredTaxaList}
    speciesName={speciesName}
    setSpeciesName={setSpeciesName}
    selectedIndex={selectedIndex}
    setSelectedIndex={setSelectedIndex}
    {...props} />;
}

export default connect(mapStateToProps, actions)(DashboardContainer);
