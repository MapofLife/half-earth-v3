/* eslint-disable camelcase */

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import countryDataActions from 'redux_modules/country-data';

import { DASHBOARD } from 'router';

import { tx } from '@transifex/native';
import { useLocale, useT } from '@transifex/react';

import * as urlActions from 'actions/url-actions';

import {
  getCustomAOISpeciesData,
  getAoiFromDataBase,
} from 'utils/geo-processing-services';
import { activateLayersOnLoad } from 'utils/layer-manager-utils';
import { setBasemap } from 'utils/layer-manager-utils.js';

import EsriFeatureService from 'services/esri-feature-service';

import { NAVIGATION, REGION_OPTIONS } from 'constants/dashboard-constants.js';
import {
  BIRDS,
  MAMMALS,
  REPTILES,
  AMPHIBIANS,
} from 'constants/geo-processing-services';
import {
  COUNTRIES_DATA_SERVICE_URL,
  DASHBOARD_URLS,
  LAYERS_URLS,
} from 'constants/layers-urls';
import {
  AMPHIBIAN_LOOKUP,
  BIRDS_LOOKUP,
  GADM_0_ADMIN_AREAS_FEATURE_LAYER,
  GADM_1_ADMIN_AREAS_FEATURE_LAYER,
  MAMMALS_LOOKUP,
  REPTILES_LOOKUP,
  WDPA_OECM_FEATURE_DATA_LAYER
 } from 'constants/layers-slugs.js';
import { layersConfig } from 'constants/mol-layers-configs';
import DashboardComponent from './dashboard-component.jsx';
import mapStateToProps from './dashboard-selectors.js';
import useJWTToken from 'hooks/useJWTToken';

const actions = { ...countryDataActions, ...urlActions };

function DashboardContainer(props) {
  const locale = useLocale();
  const t = useT();
  const {
    viewSettings,
    countryISO,
    queryParams,
    setCountryDataLoading,
    setCountryDataReady,
    setCountryDataError,
    browsePage,
    lang,
  } = props;
  const { getToken } = useJWTToken(countryISO);

  const [geometry, setGeometry] = useState(null);
  const [speciesInfo, setSpeciesInfo] = useState(null);
  const [data, setData] = useState(null);
  const [dataLayerData, setDataLayerData] = useState(null);
  const [privateOccurrenceData, setPrivateOccurrenceData] = useState([]);
  const [taxaList, setTaxaList] = useState([]);
  const [allTaxa, setAllTaxa] = useState([]);
  const [dataByCountry, setDataByCountry] = useState(null);
  const [spiDataByCountry, setSpiDataByCountry] = useState(null);
  const [selectedTaxa, setSelectedTaxa] = useState('');
  const [filteredTaxaList, setFilteredTaxaList] = useState([]);
  const [scientificName, setScientificName] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(NAVIGATION.HOME);
  // const [loggedIn, setLoggedIn] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState();
  const [selectedGeometryRings, setSelectedGeometryRings] = useState();
  const [fromTrends, setFromTrends] = useState(false);
  const [regionLayers, setRegionLayers] = useState({});
  const [selectedRegionOption, setSelectedRegionOption] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState();
  const [exploreAllSpecies, setExploreAllSpecies] = useState(null);
  const [tabOption, setTabOption] = useState(2);
  const [provinceName, setProvinceName] = useState();
  const [regionName, setRegionName] = useState();
  const [speciesListLoading, setSpeciesListLoading] = useState(true);
  const [prioritySpeciesList, setPrioritySpeciesList] = useState();
  const [mapLegendLayers, setMapLegendLayers] = useState([]);
  const [speciesToAvoid, setSpeciesToAvoid] = useState();
  const [hash, setHash] = useState();
  const [flaggedSpecies, setFlaggedSpecies] = useState();
  const [updateFlaggedSpecies, setUpdateFlaggedSpecies] = useState(false);

  const getQueryParams = () => {
    if (queryParams) {
      const {
        species,
        tab,
        trend,
        region,
        province,
        regionName,
        regionLayers,
        selectedRegionOption,
        exploreAll,
        lang,
        hash,
      } = queryParams;

      if (species) {
        setScientificName(species);
      }

      if (regionName) {
        setRegionName(regionName);
      }

      if (tab) {
        setSelectedIndex(tab);
      }

      if (trend) {
        setTabOption(trend);
      }

      if (region) {
        setSelectedRegion(region);
      }

      if (province) {
        setProvinceName(province);
      }

      if (exploreAll) {
        setExploreAllSpecies(true);
      }

      if (regionLayers) {
        setRegionLayers(regionLayers);
      }

      if (selectedRegionOption) {
        setSelectedRegionOption(selectedRegionOption);
      }

      if (lang) {
        tx.setCurrentLocale(lang);
      }

      if (hash) {
        setHash(hash);
      }
    }
  };

  const getSpeciesData = async () => {
    const url = `https://api.mol.org/2.x/species/info?lang=${lang}&scientificname=${scientificName}`;
    const response = await fetch(url);
    const d = await response.json();
    setSpeciesInfo(d[0]);
  };

  const getDataLayersData = async () => {
    if (countryISO === 'COD' || countryISO === 'GIN' || countryISO === 'GUY') {
      let url = '';
      if (countryISO === 'COD') {
        url = DASHBOARD_URLS.PRIVATE_COD_OCCURENCE_LAYER;
      } else if(countryISO === 'GUY') {
        url = DASHBOARD_URLS.PRIVATE_GUY_OCCURENCE_LAYER;
      } else if(countryISO === 'GIN') {
        url = DASHBOARD_URLS.PRIVATE_GIN_OCCURENCE_LAYER;
      }

    const privateOccurrenceDataResponse =
        await EsriFeatureService.getFeatures({
          url,
          whereClause: `scientificname = '${scientificName}'`,
          returnGeometry: false,
        });
      if (privateOccurrenceDataResponse?.length > 0) {
        const privateOccurrenceItems = privateOccurrenceDataResponse.map(
          (item) => item.attributes
        );

        setPrivateOccurrenceData(privateOccurrenceItems);
      } else {
        setPrivateOccurrenceData([]);
      }
    }

    let gbifResponse;

    if (countryISO === 'EE') {
      gbifResponse = await EsriFeatureService.getFeatures({
        url: DASHBOARD_URLS.ZONE_OCCURRENCE,
        whereClause: `species = '${scientificName}' and source = 'GBIF' and  ISO3 IN ('BRA', 'MEX', 'PER',  'VNM', 'MDG')`,
        returnGeometry: false,
      });
    } else {
      // gbifResponse = await EsriFeatureService.getFeatures({
      //   url: DASHBOARD_URLS.GUY_SPECIES_OCCURENCE_URL,
      //   whereClause: `species = '${scientificName}' and source = 'GBIF' and iso3 = '${countryISO}'`,
      //   returnGeometry: false,
      // });
    }

    const gbifResponseItems = gbifResponse?.map((item) => item.attributes);
    const gbifSet = new Set(); // Use a Set for efficient tracking
    const uniqueGbifObjects = [];

    gbifResponseItems?.forEach((obj) => {
      if (obj) {
        const { molid } = obj;

        const keyValue = `${molid}`;

        if (!gbifSet.has(keyValue)) {
          gbifSet.add(keyValue);
          uniqueGbifObjects.push(obj);
        }
      }
    });

    let eBirdResponse;
    if (countryISO === 'EE') {
      eBirdResponse = await EsriFeatureService.getFeatures({
        url: DASHBOARD_URLS.ZONE_OCCURRENCE,
        whereClause: `species = '${scientificName}' and source = 'eBird' and ISO3 IN ('BRA', 'MEX', 'PER',  'VNM', 'MDG')`,
        returnGeometry: false,
      });
    } else {
      // eBirdResponse = await EsriFeatureService.getFeatures({
      //   url: DASHBOARD_URLS.GUY_SPECIES_OCCURENCE_URL,
      //   whereClause: `species = '${scientificName}' and source = 'eBird' and iso3 = '${countryISO}'`,
      //   returnGeometry: false,
      // });
    }

    const eBirdResponseItems = eBirdResponse?.map((item) => item.attributes);
    const ebirdSet = new Set(); // Use a Set for efficient tracking
    const uniqueEBirdObjects = [];

    eBirdResponseItems?.forEach((obj) => {
      if (obj) {
        const { molid } = obj;

        const keyValue = `${molid}`;

        if (!ebirdSet.has(keyValue)) {
          ebirdSet.add(keyValue);
          uniqueEBirdObjects.push(obj);
        }
      }
    });

    const dataLayerParams = {
      scientificname: scientificName,
      group: 'movement',
      lang: locale,
    };
    const dparams = new URLSearchParams(dataLayerParams);
    const dataLayersURL = `https://api.mol.org/2.x/species/datasets?${dparams}`;

    const apiCalls = [dataLayersURL];

    const apiResponses = await Promise.all(
      apiCalls.map(async (url) => {
        const response = await fetch(url);
        try {
          const d = await response.json();
          return d;
        } catch (error) {
          return [];
        }
      })
    );

    const [dataLayersData] = apiResponses;

    const filteredData = dataLayersData.map((dld) => {
      if (dld.dataset_title.toUpperCase().match(/EBIRD/)) {
        if (uniqueEBirdObjects.length > 0) {
          dld.no_rows = uniqueEBirdObjects.length;
        } else {
          // dld.no_rows = 0;
        }
      }

      if (dld.dataset_title.toUpperCase().match(/GBIF/)) {
        if (uniqueGbifObjects.length > 0) {
          dld.no_rows = uniqueGbifObjects.length;
        } else {
          // dld.no_rows = 0;
        }
      }

      dld.parent = dld.type_title;
      dld.label = dld.dataset_title;

      return dld;
    });

    setDataLayerData(filteredData);
  };

  const getTaxaSpecies = async (taxa, slices) => {
    const json = JSON.parse(slices);
    let url;

    switch (taxa) {
      case 'amphibians':
        url = LAYERS_URLS[AMPHIBIAN_LOOKUP];
        break;
      case 'birds':
        url = LAYERS_URLS[BIRDS_LOOKUP];
        break;
      case 'mammals':
        url = LAYERS_URLS[MAMMALS_LOOKUP];
        break;
      case 'reptiles':
        url = LAYERS_URLS[REPTILES_LOOKUP];
        break;
      default:
        break;
    }

    const response = await EsriFeatureService.getFeatures({
      url,
      whereClause: `SliceNumber IN (${json
        .map((s) => s.SliceNumber)
        .join(',')})`,
      returnGeometry: false,
    });

    return {
      taxa,
      title: t(taxa),
      count: json.length,
      species: response.map((r) => r.attributes),
    };
  };

  const bucketByTaxa = (arrayOfObjects) => {
    const buckets = {};

    if (arrayOfObjects?.length) {
      arrayOfObjects.forEach((obj) => {
        const { taxa } = obj.attributes;

        if (taxa) {
          let bucket = taxa;
          if (
            taxa.toLowerCase() === 'vascular_plants' ||
            taxa.toLowerCase() === 'non_vascular_plants'
          ) {
            bucket = 'other plants';
          }

          // Check if taxa property exists and has a value
          if (!buckets[bucket]) {
            buckets[bucket] = []; // Create a new bucket if it doesn't exist
          }
          buckets[bucket].push(obj); // Add the object to the corresponding bucket
        } else {
          // Handle cases where the taxa property is missing or undefined.
          // You might want to create a special bucket for these, or log a warning, or skip them.
          if (!buckets.undefined) {
            buckets.undefined = [];
          }
          buckets.undefined.push(obj);

          console.warn("Object missing 'taxa' property:", obj); // Or simply skip the object
        }
      });
    }

    return buckets;
  };

  function removeDuplicatesByScientificName(arr) {
    const seenScientificNames = new Set(); // Use a Set for efficient tracking
    const uniqueObjects = [];
    arr.forEach((obj) => {
      if (obj) {
        const { scientific_name } = obj;

        if (!seenScientificNames.has(scientific_name)) {
          seenScientificNames.add(scientific_name);
          uniqueObjects.push(obj);
        }
      }
    });
    return uniqueObjects;
  }

  const getProtectAreasSpeciesDetails = (speciesData, taxa) => {
    const results = speciesData.species.map(
      ({ scientific_name, common_name, attributes }) => {
        if(attributes !== 'NA'){
          const { source, species_url, threat_status } = JSON.parse(
            attributes.replace(/NA/g, null).replace(/NaN/g, 'null')
          )[0];

          const isFound = speciesToAvoid?.map((item) => item.toUpperCase())
            .includes(scientific_name.toUpperCase());

          if (!isFound) {
            return {
              common_name,
              scientific_name,
              threat_status,
              source: source ?? 'range',
              species_url,
              taxa,
            };
          }
        } else if(attributes === 'NA') {
          return {
              scientific_name,
              source: 'range',
              taxa,
            };
        }
      }
    );

    const species = removeDuplicatesByScientificName(results);

    return {
      count: speciesData.species.length,
      species,
      taxa,
      title: taxa,
    };
  };

  const getCustomAreasSpeciesDetails = (speciesData, taxa) => {
    const results = speciesData.map(({ name, commonName, threat_status, species_url }) => {
      const isFound = speciesToAvoid?.map((item) => item.toUpperCase())
        .includes(name.toUpperCase());
      let common_name = commonName || name;
      if (Array.isArray(commonName)) {
        [common_name] = commonName;
      }
      if (!isFound) {
        return {
          common_name,
          scientific_name: name,
          threat_status,
          source: 'range',
          species_url,
          taxa,
        };
      }
    });

    const species = removeDuplicatesByScientificName(results);

    return {
      count: speciesData.length,
      species,
      taxa,
      title: taxa,
    };
  };

  const getSpeciesDetails = (speciesData, taxa, productType = '') => {
    const results = speciesData.map(({ attributes }) => {
      const { source, species_url, threat_status, commonnames } =
        countryISO !== 'EEWWF'
          ? attributes
          : JSON.parse(attributes.replace(/NA/g, null).replace(/NaN/g, 'null'))[0];

      return {
        common_name: commonnames,
        scientificname: attributes.species ?? attributes.scientificname,
        threat_status,
        source,
        species_url,
        taxa,
        product_type: productType,
      };
    });

    const species = removeDuplicatesByScientificName(results);

    return {
      count: speciesData.length,
      species,
      taxa,
      title: taxa,
    };
  };

  const getPrivateOccurrenceSpecies = async (speciesData) => {
    const list = [...speciesData];

    let url = '';

    if (countryISO === 'COD') {
      url = DASHBOARD_URLS.PRIVATE_COD_OCCURENCE_LAYER;
    } else if(countryISO === 'GUY') {
      url = DASHBOARD_URLS.PRIVATE_GUY_OCCURENCE_LAYER;
    } else if(countryISO === 'GIN') {
      url = DASHBOARD_URLS.PRIVATE_GIN_OCCURENCE_LAYER;
    }

    let whereClause = `1=1`;

    let geoRings = null;
    if (selectedGeometryRings) {
      geoRings = {
        rings: selectedGeometryRings,
      };
    }

    const occurenceFeatures = await EsriFeatureService.getFeatures({
      url,
      whereClause,
      returnDistinctValues: true,
      geometry: geoRings,
      returnGeometry: false,
      outFields: ['*'],
    });

    // if (countryISO.toUpperCase() !== 'EE') {
    const buckets = bucketByTaxa(occurenceFeatures);

    // loop through buckets to get species info
    // TODO: remove this for the count, but keep for searching species
    const occurenceData = Object.keys(buckets).map((key) => {
      return getSpeciesDetails(buckets[key], key, 'private');
    });

    occurenceData?.forEach((occurrence) => {
      const foundTaxa = list.find((sp) => sp.taxa === occurrence.taxa);

      if (foundTaxa) {
        occurrence.species.forEach((species) => {
          const isFound = speciesToAvoid?.map((item) => item.toUpperCase())
            .includes(species.scientificname.toUpperCase());

          if (!isFound) {
            const foundSpecies = foundTaxa?.species.find(
              (speciesToFind) =>
                speciesToFind?.scientificname.toUpperCase() ===
                species?.scientificname.toUpperCase()
            );

            if (!foundSpecies) {
              foundTaxa?.species.push(species);
            } else {
              foundSpecies.source += `,${species.source}`;
              foundSpecies.product_type += `,${species.product_type}`;
            }
          }
        });
      } else {
        list.push(occurrence);
      }
    });

    list.forEach((l) => {
      l.count = l.species.length;
    });

    setTaxaList(list);
  }

  const getOccurenceSpecies = async (speciesData) => {
    let url = DASHBOARD_URLS.SPECIES_OCCURENCE_URL;

    let whereClause = `iso3 = '${countryISO}'`;
    if (countryISO === 'GUY') {
      url = DASHBOARD_URLS.GUY_SPECIES_OCCURENCE_URL;
    }
    // else if (selectedRegion) {
    //   const { GID_1, WDPA_PID, Int_ID, region_key } = selectedRegion;
    //   if (GID_1) {
    //     whereClause = `GID_1 = '${GID_1}'`;
    //   }

    //   if (WDPA_PID) {
    //     url = DASHBOARD_URLS.WDPA;
    //     whereClause = `wdpaid = '${WDPA_PID}'`;
    //   }

    //   if (Int_ID) {
    //     url = DASHBOARD_URLS.NBIS_URL;
    //     whereClause = `Int_ID = '${Int_ID}'`;
    //   }

    //   if (region_key) {
    //     if (countryISO === 'GUY-FM') {
    //       url = DASHBOARD_URLS.ZONE_OCCURRENCE;
    //     }

    //     if (selectedRegionOption === REGION_OPTIONS.RAPID_INVENTORY_32) {
    //       url = DASHBOARD_URLS.RAPID_INVENTORY_SPECIES;
    //     }
    //     whereClause = `region_key = '${region_key}'`;
    //   }
    // }

    // if (
    //   selectedRegion &&
    //   selectedRegionOption === REGION_OPTIONS.RAPID_INVENTORY_32
    // ) {
    //   const { region_key } = selectedRegion;
    //   url = DASHBOARD_URLS.RAPID_INVENTORY_SPECIES;

    //   whereClause = `region_key = '${region_key}'`;
    // }

    // if (!selectedRegion?.mgc) {
    if (
      selectedRegionOption !== REGION_OPTIONS.RAPID_INVENTORY_32
    ){
      let geoRings = null;
      if (selectedGeometryRings) {
        geoRings = {
          rings: selectedGeometryRings,
        };
      }

      const occurenceFeatures = await EsriFeatureService.getFeatures({
        url,
        whereClause,
        returnDistinctValues: true,
        geometry: geoRings,
        returnGeometry: false,
        outFields: ['*'],
      });

      const list = [...speciesData];

      // if (countryISO.toUpperCase() !== 'EE') {
      const buckets = bucketByTaxa(occurenceFeatures);

      // loop through buckets to get species info
      // TODO: remove this for the count, but keep for searching species
      const occurenceData = Object.keys(buckets).map((key) => {
        return getSpeciesDetails(buckets[key], key, 'points');
      });

      occurenceData?.forEach((occurrence) => {
        const foundTaxa = list.find((sp) => sp.taxa === occurrence.taxa);

        if (foundTaxa) {
          occurrence.species.forEach((species) => {
            const isFound = speciesToAvoid?.map((item) => item.toUpperCase())
              .includes(species.scientificname.toUpperCase());

            if (!isFound) {
              const foundSpecies = foundTaxa?.species.find(
                (speciesToFind) =>
                  speciesToFind?.scientificname.toUpperCase() ===
                  species?.scientificname.toUpperCase()
              );

              if (!foundSpecies) {
                foundTaxa?.species.push(species);
              } else {
                foundSpecies.source += `,${species.source}`;
              }
            }
          });
        } else {
          list.push(occurrence);
        }
      });

      list.forEach((l) => {
        l.count = l.species.length;
      });
      // }

      if (exploreAllSpecies) {
        setAllTaxa(list);
      }
      setTaxaList(list);
    }
    else {
      setTaxaList(speciesData);
    }
    setSpeciesListLoading(false);
  };

  const loadSpecies = async (data) => {
    let result = data;

    if (data.file_url) {
      const response = await fetch(result.file_url);
      result = await response.json();
    }

    const seasons = [
      '',
      'Resident',
      'Breeding',
      'Non-breeding',
      'Passage',
      '',
    ];

    const {taxas, datasets} = result;

    taxas?.forEach(taxa => {
      const taxaDatasetSet = new Set();
      taxa.species.forEach(species => {

        const foundFlaggedSpecies = flaggedSpecies?.find(fs => fs.scientificname === species.scientificname);
        if(foundFlaggedSpecies){
          species.flagged = foundFlaggedSpecies;
        } else {
          species.flagged = false;
        }

        if(foundFlaggedSpecies?.deleted){
          return;
        } else {
          const speciesDatasets = Object.keys(species.dataset);
          speciesDatasets.forEach(d => {
            taxaDatasetSet.add(d);
          });
          const speciesDataset2 = {};
          speciesDatasets.forEach(k => {
            speciesDataset2[datasets[k].dataset_id] =
              species.dataset[k];
          });
          species.datasetList = speciesDatasets.map(dsid => ({
            dataset_id: datasets[dsid].dataset_id,
            product_type: datasets[dsid].product_type,
            title: datasets[dsid].title,
            seasonality: species.dataset[dsid],
            seasonalityString: species.dataset[dsid]
              .map(s => (s === null ? 'Resident' : seasons[s]))
              .filter(s => s.length > 0)
              .join(', '),
          }));
          species.dataset = speciesDataset2;
        }
      });
      taxa.datasets = {};
      Array.from(taxaDatasetSet).forEach((d) => {
        const ds = datasets[d];
        taxa.datasets[ds.dataset_id] = ds;
      });
    });
    return result;
  }

  const getSpeciesList = async () => {
    setSpeciesListLoading(true);

    const body = {
      lang: tx.currentLocale,
      radius: "25000",
      v2: "true"
    };

    // if (exploreAllSpecies) {
      body.iso3 = countryISO;
    // }

    if (selectedRegion) {
      delete body.iso3;
      const { GID_1, WDPA_PID, mgc, Int_ID, region_key, rings, nbis_id } = selectedRegion;
      if (GID_1) {
        body.gid1 = GID_1;
      }

      if (WDPA_PID) {
        body.wdpaid = WDPA_PID;
      }

      if(rings){
        body.geojson = {
          type: 'Polygon',
          coordinates: [...rings],
        }
      }

      if(nbis_id){
        body.nbis_id = nbis_id;
      }

    }

    const speciesList = await fetch(DASHBOARD_URLS.REGIONS_MOL_DATA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await speciesList.json();
    const speciesLoaded = await loadSpecies(data);
    if(speciesLoaded?.taxas){
      if(selectedRegionOption !== REGION_OPTIONS.RAPID_INVENTORY_32){
      const privateDataAndSpecies = await getPrivateOccurrenceSpecies(speciesLoaded.taxas);
      }
      getOccurenceSpecies(speciesLoaded.taxas);
    } else {
      setSpeciesListLoading(false);
    }
  };

  const getSpiDataByCountry = (d) => {
    const spiCountryData = d.reduce((acc, obj) => {
      const key = obj.country_name;
      if (!acc[key]) {
        acc[key] = { shs: [] };
      }
      acc[key].shs.push(obj);
      return acc;
    }, {});

    setSpiDataByCountry(spiCountryData);
  };

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
  };

  const getPrioritySpeciesList = async () => {
    const url = DASHBOARD_URLS.PRIORITY_SPECIES;
    const whereClause = `country_code = '${countryISO}'`;

    const features = await EsriFeatureService.getFeatures({
      url,
      whereClause,
      returnGeometry: false,
    });

    if (features) {
      const species = features.map(({ attributes }) => attributes);

      setPrioritySpeciesList(species);
    } else {
      setPrioritySpeciesList([]);
    }
  };

  const getFlaggedSpeciesList = async () => {
    const token = await getToken();

    let url = DASHBOARD_URLS.GET_FLAGGED_SPECIES_URL;

    url += `?region_field=${selectedRegion ? Object.keys(selectedRegion)?.[0] : 'iso3'}&region_code=${selectedRegion ? Object.values(selectedRegion)?.[0] : countryISO}&iso3=${countryISO}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ISO3: countryISO,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    setFlaggedSpecies(data);
  };

  const getIgnoredSpeciesList = async () => {
    const url = DASHBOARD_URLS.IGNORE_SPECIES_LIST;
    const whereClause = `country_code = '${countryISO}'`;

    const features = await EsriFeatureService.getFeatures({
      url,
      whereClause,
      returnGeometry: false,
    });

    if (features) {
      const species = features.map(({ attributes }) => attributes.species_name);

      setSpeciesToAvoid(species);
    } else {
      setSpeciesToAvoid([]);
    }
  };

  const handleMapLoad = (map, activeLayers) => {
    setBasemap({
      map,
      layersArray: viewSettings.basemap.layersArray,
    });
    activateLayersOnLoad(map, activeLayers, layersConfig);
  };

  const getData = async () => {
    if (countryISO.toLowerCase() === 'ee') {
      const shsCall = EsriFeatureService.getFeatures({
        url: DASHBOARD_URLS.REGION_BIODIVERSITY_SHS_URL,
        whereClause: `species = '${scientificName}'`,
        returnGeometry: false,
      });

      const spsCall = EsriFeatureService.getFeatures({
        url: DASHBOARD_URLS.REGION_BIODIVERSITY_URL,
        whereClause: `species = '${scientificName}'`,
        returnGeometry: false,
      });

      const apiCalls = [shsCall, spsCall];

      const apiResponses = await Promise.all(
        apiCalls.map(async (url) => {
          const response = await url;
          // const d = await response.json();
          return response;
        })
      );

      const [habitatTrendData, spiScoreData] = apiResponses;

      const shiScoreData = habitatTrendData.map((f) => {
        return f.attributes;
      });

      let countryData;

      // TODO: figure out what to do when no shs is returned
      if (shiScoreData) {
        countryData = shiScoreData.reduce((acc, obj) => {
          const key = obj.name;
          if (!acc[key]) {
            acc[key] = { shs: [], frag: [] };
          }
          acc[key].shs.push(obj);
          return acc;
        }, {});
      }

      if (shiScoreData.frag) {
        countryData = features.reduce((acc, obj) => {
          const key = obj.country;
          if (!acc[key]) {
            acc[key] = { shs: [], frag: [] };
          }

          acc[key].frag.push(obj);
          return acc;
        }, countryData || {});
      }

      Object.keys(countryData).forEach((key) => {
        const cData = countryData[key];
        const sortedData = cData.shs.sort((a, b) => {
          const yearA = a.year;
          const yearB = b.year;
          if (yearA < yearB) {
            return -1;
          }
          if (yearA > yearB) {
            return 1;
          }
          return 0;
        });

        countryData[key].shs = sortedData;
      });

      let spiCountryData = {};
      if (spiScoreData) {
        const spiData = spiScoreData.map((f) => {
          return f.attributes;
        });

        spiCountryData = spiData.reduce((acc, obj) => {
          const key = obj.name;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(obj);
          return acc;
        }, {});

        Object.keys(spiCountryData).forEach((key) => {
          const cd = spiCountryData[key];
          const sortedData = cd.sort((a, b) => {
            const yearA = a.year;
            const yearB = b.year;
            if (yearA < yearB) {
              return -1;
            }
            if (yearA > yearB) {
              return 1;
            }
            return 0;
          });

          spiCountryData[key] = sortedData;
        });
      }
      setSpiDataByCountry(spiCountryData);
      setDataByCountry(countryData);

      setData({ habitatTrendData: countryData, spiScoreData: spiCountryData });
    } else {
      const habitatTrendUrl = `https://api.mol.org/2.x/species/indicators/habitat-trends/bycountry?scientificname=${scientificName}`;
      const spiScoreURL = `https://api.mol.org/2.x/indicators/sps/species_bycountry?scientificname=${scientificName}`;

      const apiCalls = [habitatTrendUrl, spiScoreURL];

      const apiResponses = await Promise.all(
        apiCalls.map(async (url) => {
          const response = await fetch(url);
          const d = await response.json();
          return d;
        })
      );

      const [habitatTrendData, spiScoreData] = apiResponses;
      getDataByCountry(habitatTrendData);
      getSpiDataByCountry(spiScoreData);
      setData({ habitatTrendData, spiScoreData });
    }
  };

  const handleBrowsePage = () => {
    browsePage({
      type: DASHBOARD,
      payload: { iso: countryISO.toLowerCase() },
      query: {
        species: scientificName ?? undefined,
        tab: selectedIndex,
        trend: tabOption ?? undefined,
        selectedRegionOption: selectedRegionOption ?? undefined,
        region: selectedRegion ?? undefined,
        regionName: regionName ?? undefined,
        exploreAll: exploreAllSpecies ?? undefined,
        // province: provinceName ?? undefined,
        lang: tx.currentLocale ?? undefined,
        hash: hash ?? undefined,
      },
    });
  };

  // Get Country information, allows to get country name
  useEffect(async () => {
    getQueryParams();

    // Function to handle back navigation
    const handleBackButton = () => {
      // Implement custom behavior here
      setSelectedIndex(window.history.state?.selectedIndex ?? 1);
    };

    // Add event listener for popstate event
    window.addEventListener('popstate', handleBackButton);

    if (countryISO !== 'EE') {
      setCountryDataLoading();
      let country = countryISO.toUpperCase();
      if (country === 'GUY-FM') {
        // Special case for French Guiana
        country = 'GUY';
      }
      EsriFeatureService.getFeatures({
        url: COUNTRIES_DATA_SERVICE_URL,
        whereClause: `GID_0 = '${country}'`,
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

      getPrioritySpeciesList();
      getIgnoredSpeciesList();
    }

    if (countryISO === 'COD' || countryISO === 'GIN') {
      await tx.setCurrentLocale('fr');
      const url = new URL(window.location.href);
      url.searchParams.set('lang', 'fr'); // Add or update the parameter

      // Update the address bar without reloading the page
      window.history.replaceState({}, '', url.toString());

    } else {
      await tx.setCurrentLocale('en');
      const url = new URL(window.location.href);
      url.searchParams.set('lang', 'en'); // Add or update the parameter

      // Update the address bar without reloading the page
      window.history.replaceState({}, '', url.toString())
    }

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (!selectedRegion && !speciesToAvoid ) return;
      getFlaggedSpeciesList();
      getSpeciesList();
  }, [selectedRegion, speciesToAvoid]);

  useEffect(() => {
    if (!updateFlaggedSpecies) return;
    getFlaggedSpeciesList();
  }, [updateFlaggedSpecies]);


  useEffect(() => {
    if (!scientificName) return;
    getSpeciesData();
  }, [scientificName]);

  useEffect(() => {
    if (!speciesInfo) return;
    getDataLayersData();
  }, [speciesInfo]);

  useEffect(() => {
    if (!dataLayerData) return;
    getData();
  }, [dataLayerData]);

  useEffect(() => {
    handleBrowsePage();
  }, [
    scientificName,
    selectedIndex,
    tabOption,
    selectedRegion,
    regionName,
    selectedRegionOption,
    provinceName,
    hash,
  ]);

  return (
      <DashboardComponent
        handleMapLoad={handleMapLoad}
        geometry={geometry}
        speciesInfo={speciesInfo}
        setSpeciesInfo={setSpeciesInfo}
        data={data}
        dataLayerData={dataLayerData}
        setDataLayerData={setDataLayerData}
        privateOccurrenceData={privateOccurrenceData}
        dataByCountry={dataByCountry}
        spiDataByCountry={spiDataByCountry}
        taxaList={taxaList}
        setTaxaList={setTaxaList}
        selectedTaxa={selectedTaxa}
        setSelectedTaxa={setSelectedTaxa}
        filteredTaxaList={filteredTaxaList}
        setFilteredTaxaList={setFilteredTaxaList}
        scientificName={scientificName}
        setScientificName={setScientificName}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        setSelectedRegion={setSelectedRegion}
        selectedRegion={selectedRegion}
        regionLayers={regionLayers}
        setRegionLayers={setRegionLayers}
        selectedRegionOption={selectedRegionOption}
        setSelectedRegionOption={setSelectedRegionOption}
        setHash={setHash}
        hash={hash}
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
        tabOption={tabOption}
        setTabOption={setTabOption}
        provinceName={provinceName}
        setProvinceName={setProvinceName}
        fromTrends={fromTrends}
        setFromTrends={setFromTrends}
        speciesListLoading={speciesListLoading}
        prioritySpeciesList={prioritySpeciesList}
        mapLegendLayers={mapLegendLayers}
        setMapLegendLayers={setMapLegendLayers}
        setExploreAllSpecies={setExploreAllSpecies}
        exploreAllSpecies={exploreAllSpecies}
        regionName={regionName}
        setRegionName={setRegionName}
        allTaxa={allTaxa}
        setSelectedGeometryRings={setSelectedGeometryRings}
        selectedGeometryRings={selectedGeometryRings}
        setGeometry={setGeometry}
        flaggedSpecies={flaggedSpecies}
        setUpdateFlaggedSpecies={setUpdateFlaggedSpecies}
        updateFlaggedSpecies={updateFlaggedSpecies}
        {...props}
      />
  );
}

export default connect(mapStateToProps, actions)(DashboardContainer);
