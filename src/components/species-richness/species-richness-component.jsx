import React, { useContext, useEffect, useState } from 'react';

import { useT } from '@transifex/react';

import { getCSSVariable } from 'utils/css-utils';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import cx from 'classnames';
import last from 'lodash/last';

import {
  SHI_LATEST_YEAR,
  SII_LATEST_YEAR,
} from 'constants/dashboard-constants.js';

import AmphibiansBlack from 'images/dashboard/amphibian_icon_black.png?react';
import AmphibiansWhite from 'images/dashboard/amphibian_icon_white.png?react';
import BirdsBlack from 'images/dashboard/bird_icon_black.png?react';
import BirdsWhite from 'images/dashboard/bird_icon_white.png?react';
import MammalsBlack from 'images/dashboard/mammal_icon_black.png?react';
import MammalsWhite from 'images/dashboard/mammal_icon_white.png?react';
import ReptilesBlack from 'images/dashboard/reptile_icon_black.png?react';
import ReptilesWhite from 'images/dashboard/reptile_icon_white.png?react';

import FishesBlack from 'images/dashboard/fish_icon_black.png?react';
import FishesWhite from 'images/dashboard/fish_icon_white.png?react';
import MarMammalsBlack from 'images/dashboard/marine_mammal_icon_black.png?react';
import MarMammalsWhite from 'images/dashboard/marine_mammal_icon_white.png?react';

import {
  MARINE,
  NATIONAL_TREND,
  PROVINCE_TREND,
  ZONE_3,
  ZONE_5,
} from '../../containers/sidebars/dashboard-trends-sidebar/dashboard-trends-sidebar-component';
import compStyles from '../../containers/sidebars/dashboard-trends-sidebar/spi/score-distibutions/score-distributions-spi-styles.module.scss';
import { LightModeContext } from '../../context/light-mode';
import SpiArcChartComponent from '../charts/spi-arc-chart/spi-arc-chart-component';

import styles from './species-richness-styles.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SpeciesRichnessComponent(props) {
  const t = useT();
  const EEWWF_YEAR = 2022;
  const {
    selectedProvince,
    activeTrend,
    spiActiveTrend,
    provinces,
    countryData,
    zoneData,
    shiActiveTrend,
    shiCountryData,
    siiCountryData,
    siiActiveTrend,
    countryISO,
    shi,
    sii,
    spi,
  } = props;

  const acceptedZones = ['ACC_3', 'ACC_5', 'MEX', 'PER', 'BRA', 'MDG', 'VNM'];
  const { lightMode } = useContext(LightModeContext);
  const [scores, setScores] = useState({
    birds: {
      count: 0,
      total: 0,
      percentage: 0,
    },
    mammals: {
      count: 0,
      total: 0,
      percentage: 0,
    },
    reptiles: {
      count: 0,
      total: 0,
      percentage: 0,
    },
    amphibians: {
      count: 0,
      total: 0,
      percentage: 0,
    },
    fishes: {
      count: 0,
      total: 0,
      percentage: 0,
    },
    marMammals: {
      count: 0,
      total: 0,
      percentage: 0,
    },
  });
  const [titleText, setTitleText] = useState();

  const getPercentage = (species) => {
    const { count } = scores[species];
    return [count, 100 - count];
  };

  const populateScores = (formattedData) => {
    // let data = JSON.parse(formattedData.richness_taxa_spi)[0];
    // let spiData = JSON.parse(formattedData.spi_taxa)[0];

    // if (shi) {
    //   data = JSON.parse(formattedData.richness_taxa_shi)[0];
    //   spiData = JSON.parse(formattedData.habitat_index_taxa)[0];
    // }

    let data = formattedData.richness_taxa_spi;
    let spiData = formattedData.spi_taxa;

    if (shi) {
      data = formattedData.richness_taxa_shi;
      spiData = formattedData.habitat_index_taxa;
    }

    if (sii) {
      data = formattedData.richness_taxa_sii;
      spiData = formattedData.sii_taxa;
    }

    if (spi) {
      data =
        spiActiveTrend === MARINE
          ? formattedData.marine_richness_taxa_spi
          : formattedData.richness_taxa_spi;
      spiData =
        spiActiveTrend === MARINE
          ? formattedData.marine_spi_taxa
          : formattedData.spi_taxa;
    }

    const {
      reptiles,
      amphibians,
      mammals,
      birds,
      fishes_marine,
      mammals_marine,
    } = data;
    setScores({
      birds: {
        count: +spiData.birds,
        total: +birds,
      },
      mammals: {
        count: +spiData.mammals,
        total: +mammals,
      },
      reptiles: {
        count: +spiData.reptiles,
        total: +reptiles,
      },
      amphibians: {
        count: +spiData.amphibians,
        total: +amphibians,
      },
      fishes: {
        count: +spiData.fishes_marine || 0,
        total: +fishes_marine || 0,
      },
      marMammals: {
        count: +spiData.mammals_marine || 0,
        total: +mammals_marine || 0,
      },
    });
  };

  const getScores = () => {
    if (countryISO.toLowerCase() === 'ee') {
      let formattedData = [];
      formattedData = zoneData.find(
        (item) =>
          item.iso3 === selectedProvince.iso3 &&
          item.region_key === selectedProvince.region_key &&
          item.year === EEWWF_YEAR
      );

      if (formattedData) {
        populateScores(formattedData);
      }
    } else if (shi) {
      let values;
      let total;

      if (
        selectedProvince &&
        (shiActiveTrend === ZONE_5 || shiActiveTrend === ZONE_3)
      ) {
        const data = zoneData.find(
          (item) => item.region_key === selectedProvince.region_key
        );

        if (data) {
          values = JSON.parse(data.habitat_index_taxa)[0];
          total = JSON.parse(data.richness_taxa_shi)[0];

          setScores({
            birds: {
              count: +values.birds * 100,
              total: +total.birds,
            },
            mammals: {
              count: +values.mammals * 100,
              total: +total.mammals,
            },
            reptiles: {
              count: +values.reptiles * 100,
              total: +total.reptiles,
            },
            amphibians: {
              count: +values.amphibians * 100,
              total: +total.amphibians,
            },
            fishes: {
              count: 0,
              total: 0,
            },
            marMammals: {
              count: 0,
              total: 0,
            },
          });
        }
      } else {
        let formattedData = [];
        if (shiActiveTrend === PROVINCE_TREND) {
          let regionData = [];
          if (!selectedProvince) {
            regionData = provinces.find(
              (item) =>
                item.year === SHI_LATEST_YEAR && item.name === provinces[0].name
            );
          } else {
            regionData = provinces.find(
              (item) =>
                item.year === SHI_LATEST_YEAR &&
                item.name === selectedProvince.name
            );
          }
          formattedData = regionData;
        } else {
          formattedData = shiCountryData.find(
            (item) => item.year === SHI_LATEST_YEAR
          );
        }

        if (formattedData) {
          populateScores(formattedData);
        }
      }
    } else if (sii) {
      let values;
      let total;

      let formattedData = [];
      if (siiActiveTrend === PROVINCE_TREND) {
        let regionData = [];
        if (!selectedProvince) {
          regionData = provinces.find(
            (item) =>
              item.year === SII_LATEST_YEAR && item.name === provinces[0].name
          );
        } else {
          regionData = provinces.find(
            (item) =>
              item.year === SII_LATEST_YEAR &&
              item.name === selectedProvince.name
          );
        }
        formattedData = regionData;
      } else {
        formattedData = siiCountryData.find(
          (item) => item.year === SII_LATEST_YEAR
        );
      }

      if (formattedData) {
        populateScores(formattedData);
      }
    } else if (spi) {
      let formattedData = [];

      if (spiActiveTrend === MARINE) {
        formattedData = last(
          countryData.filter((item) => item.level === 'country')
        );
      } else {
        if (selectedProvince && acceptedZones.includes(activeTrend)) {
          formattedData = zoneData.find(
            (item) => item.region_key === selectedProvince.region_key
          );

          if (formattedData) {
            populateScores(formattedData);
          }
        } else if (activeTrend === PROVINCE_TREND) {
          let regionData = [];
          if (!selectedProvince) {
            regionData = provinces.filter(
              (region) => region.name === provinces[0].name
            );
          } else {
            regionData = provinces.filter(
              (region) => region.name === selectedProvince.name
            );
          }
          formattedData = last(regionData);
        } else {
          formattedData = last(countryData);
        }
      }

      if (
        countryISO.toLowerCase() !== 'ee' &&
        countryISO.toLowerCase() !== 'guy-fm'
      ) {
        if (formattedData) {
          populateScores(formattedData);
        }
      } else {
        const {
          BirdSpeciesRichness,
          BirdSPI,
          MammalSpeciesRichness,
          MammalSPI,
          ReptileSpeciesRichness,
          ReptileSPI,
          AmphibianSpeciesRichness,
          AmphibianSPI,
        } = formattedData;

        setScores({
          birds: {
            count: BirdSPI,
            total: BirdSpeciesRichness,
          },
          mammals: {
            count: MammalSPI,
            total: MammalSpeciesRichness,
          },
          reptiles: {
            count: ReptileSPI,
            total: ReptileSpeciesRichness,
          },
          amphibians: {
            count: AmphibianSPI,
            total: AmphibianSpeciesRichness,
          },
          fishes: {
            count: 0,
            total: 0,
          },
          marMammals: {
            count: 0,
            total: 0,
          },
        });
      }
    }
  };

  const emptyArcColor = lightMode
    ? getCSSVariable('dark-opacity')
    : getCSSVariable('white-opacity-20');

  const birdData = {
    labels: [t('Birds'), t('Remaining')],
    datasets: [
      {
        label: '',
        data: getPercentage('birds'),
        backgroundColor: [getCSSVariable('birds'), emptyArcColor],
        borderColor: [getCSSVariable('birds'), emptyArcColor],
        borderWidth: 1,
      },
    ],
  };

  const mammalsData = {
    labels: [t('Mammals'), t('Remaining')],
    datasets: [
      {
        label: '',
        data: getPercentage('mammals'),
        backgroundColor: [getCSSVariable('mammals'), emptyArcColor],
        borderColor: [getCSSVariable('mammals'), emptyArcColor],
        borderWidth: 1,
      },
    ],
  };

  const reptilesData = {
    labels: [t('Reptiles'), t('Remaining')],
    datasets: [
      {
        label: '',
        data: getPercentage('reptiles'),
        backgroundColor: [getCSSVariable('reptiles'), emptyArcColor],
        borderColor: [getCSSVariable('reptiles'), emptyArcColor],
        borderWidth: 1,
      },
    ],
  };

  const amphibianData = {
    labels: [t('Amphibians'), t('Remaining')],
    datasets: [
      {
        label: '',
        data: getPercentage('amphibians'),
        backgroundColor: [getCSSVariable('amphibians'), emptyArcColor],
        borderColor: [getCSSVariable('amphibians'), emptyArcColor],
        borderWidth: 1,
      },
    ],
  };

  const fishesData = {
    labels: [t('Fish'), t('Remaining')],
    datasets: [
      {
        label: '',
        data: getPercentage('fishes'),

        backgroundColor: [getCSSVariable('fishes'), emptyArcColor],
        borderColor: [getCSSVariable('fishes'), emptyArcColor],
        borderWidth: 1,
      },
    ],
  };

  const marMammalsData = {
    labels: [t('Marine Mammals'), t('Remaining')],
    datasets: [
      {
        label: '',
        data: getPercentage('marMammals'),

        backgroundColor: [getCSSVariable('marine-mammals'), emptyArcColor],
        borderColor: [getCSSVariable('marine-mammals'), emptyArcColor],
        borderWidth: 1,
      },
    ],
  };

  const getData = () => {
    const group = 'BY TAXONOMIC GROUP';

    if (shi) {
      if (shiActiveTrend === NATIONAL_TREND || !selectedProvince) {
        setTitleText(`${t('NATIONAL')} SHI ${group}`);
      } else if (shiActiveTrend === PROVINCE_TREND && selectedProvince) {
        setTitleText(`${selectedProvince?.name} SHI ${group}`);
      } else if (acceptedZones.includes(activeTrend) && selectedProvince) {
        setTitleText(`${selectedProvince?.name} SHI ${group}`);
      }
    } else if (sii) {
      if (siiActiveTrend === NATIONAL_TREND || !selectedProvince) {
        setTitleText(`${t('NATIONAL')} SII ${group}`);
      } else if (siiActiveTrend === PROVINCE_TREND && selectedProvince) {
        setTitleText(`${selectedProvince?.name} SII ${group}`);
      } else if (acceptedZones.includes(activeTrend) && selectedProvince) {
        setTitleText(`${selectedProvince?.name} SII ${group}`);
      }
    } else if (spi) {
      if (spiActiveTrend === MARINE) {
        setTitleText(`${t('NATIONAL')} MARINE SPI ${group}`);
      } else if (activeTrend === NATIONAL_TREND || !selectedProvince) {
        setTitleText(`${t('NATIONAL')} SPI ${group}`);
      } else if (activeTrend === PROVINCE_TREND && selectedProvince) {
        setTitleText(`${selectedProvince?.name} SPI ${group}`);
      } else if (acceptedZones.includes(activeTrend) && selectedProvince) {
        setTitleText(`${selectedProvince?.name} SPI ${group}`);
      }
    }
    getScores();
  };

  useEffect(() => {
    if (countryISO.toLowerCase() === 'ee') {
      getScores();
    }
  }, []);

  useEffect(() => {
    if (!countryData.length || !shiCountryData.length || !siiCountryData.length)
      return;
    getData();
  }, [countryData, shiCountryData, siiCountryData]);

  useEffect(() => {
    if (!selectedProvince) return;
    getData();
  }, [
    selectedProvince,
    activeTrend,
    shiActiveTrend,
    siiActiveTrend,
    spiActiveTrend,
  ]);

  return (
    <div className={cx(lightMode ? styles.light : '', styles.container)}>
      <div className={styles.title}>{titleText}</div>
      <div className={styles.spis}>
        {spiActiveTrend === MARINE && (
          <>
            <SpiArcChartComponent
              value={scores.fishes.count}
              scores={scores}
              data={fishesData}
              img={lightMode ? FishesBlack : FishesWhite}
              species="fishes"
            />
            <SpiArcChartComponent
              value={scores.marMammals.count}
              scores={scores}
              data={marMammalsData}
              img={lightMode ? MarMammalsBlack : MarMammalsWhite}
              species="marMammals"
              customName={t('Marine Mammals')}
            />
          </>
        )}
        {spiActiveTrend !== MARINE && (
          <>
            <SpiArcChartComponent
              value={scores.birds.count}
              scores={scores}
              data={birdData}
              img={lightMode ? BirdsBlack : BirdsWhite}
              species="birds"
            />
            <SpiArcChartComponent
              value={scores.mammals.count}
              scores={scores}
              data={mammalsData}
              img={lightMode ? MammalsBlack : MammalsWhite}
              species="mammals"
            />
            <SpiArcChartComponent
              value={scores.reptiles.count}
              scores={scores}
              data={reptilesData}
              img={lightMode ? ReptilesBlack : ReptilesWhite}
              species="reptiles"
            />
            <SpiArcChartComponent
              value={scores.amphibians.count}
              scores={scores}
              data={amphibianData}
              img={lightMode ? AmphibiansBlack : AmphibiansWhite}
              species="amphibians"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default SpeciesRichnessComponent;
