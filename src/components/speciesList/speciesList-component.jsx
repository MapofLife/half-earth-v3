import React, { useContext, useEffect, useState } from 'react';
import styles from './speciesList-component-styles.module.scss';
import cx from 'classnames';
import Button from 'components/button';
import { LightModeContext } from '../../context/light-mode';


function SpeciesListComponent(props) {
  const { taxaList, selectedTaxa, setSelectedTaxa } = props

  const { lightMode } = useContext(LightModeContext);
  const SPHINGID_MOTHS = /Sphingid moths/gi;

  const [filter, setFilter] = useState();
  const [inFilter, setInFilter] = useState(0);
  const [familyCounts, setFamilyCounts] = useState({});
  const [selectedTaxaObj, setSelectedTaxaObj] = useState();

  useEffect(() => {
    if (!selectedTaxa) return;
    console.log(selectedTaxa);
    updateSelectedTaxa(selectedTaxa);

  }, []);

  useEffect(() => {
    if (!taxaList) return;
    console.log(taxaList);
  }, [taxaList]);

  useEffect(() => {
    if (!selectedTaxaObj) return;
    applyFilter();
  }, [selectedTaxaObj])



  const getTaxaTitle = (label, taxa) => {
    const taxaToCheck = [
      'MAMMALS',
      'BIRDS',
      'REPTILES',
      'AMPHIBIANS',
      'CONIFERS',
      'CACTI',
      'PALMS',
      'OTHER PLANTS*', // because the backend sends a * already
    ];
    if (taxa) {
      if (taxa.match(SPHINGID_MOTHS)) {
        return `Old World ${label}*`;
      }
      if (!taxaToCheck.includes(taxa.toUpperCase())) {
        return `${label}*`;
      }
    }

    return label;
  }

  const updateSelectedTaxa = (taxa) => {
    if (!taxa) return;

    setFilter('');
    setSelectedTaxa(taxa);

    const sto = taxaList.find(t => t.taxa === taxa);
    if (sto === undefined) return;

    setInFilter(sto?.species?.length);

    setFamilyCounts({});

    const transformer = sp => ({
      ...sp,
      visible: true,
      filterString: [sp.scientificname, sp.common, sp.family, sp.family_common]
        .join(' ')
        .toLocaleLowerCase(),
    });
    const transformed = [];
    sto?.species?.forEach(sp => {
      let species = sp;
      if (!familyCounts[species.family]) {
        familyCounts[species.family] = {
          total: 1,
          visibleCount: 0,
        };
        species.first = true;
      } else {
        species.first = false;
        familyCounts[species.family].total += 1;
      }
      species = transformer(species);
      species.familyObj = familyCounts[species.family];
      transformed.push(species);
    });
    sto.species = transformed;
    setFamilyCounts(familyCounts);
    setSelectedTaxaObj(sto);
  }

  const applyFilter = () => {
    setFilter(filter?.toLowerCase().trim());

    // this.virtualScroll?.scrollToIndex(0);
    const inFilterCheck = sp => sp.filterString.indexOf(filter) > -1;
    setInFilter(0);

    // clear the counts
    const fc = familyCounts;
    Object.keys(fc).forEach(k => {
      fc[k].visibleCount = 0;
    });

    // sort by family common
    const familySortedSpecies = sortFilteredSpecies(
      selectedTaxaObj.species,
    );

    // group by family common
    let groupByFamily = familySortedSpecies.reduce((group, result) => {
      const catName = result.family[0] ?? '__blank';

      const updateResult = { ...result };

      updateResult.visible = inFilterCheck(result);
      if (updateResult.visible) {
        let inf = inFilter;
        setInFilter(inf++);
        fc[updateResult.family].visibleCount += 1;

        group[catName] = group[catName] ?? [];
        group[catName].push(updateResult);
      }

      setFamilyCounts(fc);
      return group;
    }, {});

    // sort family common by common
    const groupKeys = Object.keys(groupByFamily);

    groupKeys.forEach(groupKey => {
      groupByFamily[groupKey].sort((a, b) => {
        if (a.scientificname < b.scientificname) {
          return -1;
        }
        if (a.scientificname > b.scientificname) {
          return 1;
        }
        return 0;
      });
    });

    const keyLength = Object.keys(groupByFamily).length - 1;

    // check if there is a group with no name
    if (Object.keys(groupByFamily)[keyLength] === '') {
      const noNameGroup = Object.values(groupByFamily)[keyLength];
      delete groupByFamily[Object.keys(groupByFamily)[keyLength]];
      groupByFamily = { ...groupByFamily, __blank: noNameGroup };
    }

    selectedTaxaObj.filteredSpecies = groupByFamily;
    console.log(selectedTaxaObj)
  }

  const clearSelection = () => {
    setSelectedTaxa('');
  }

  const sortFilteredSpecies = (species) => {
    return species.sort((a, b) => {
      if (a.family[0] < b.family[0]) {
        return -1;
      }
      if (a.family[0] > b.family[0]) {
        return 1;
      }
      return 0;
    });
  }

  return (
    <div className={cx(lightMode ? styles.light : '', styles.filters)}>
      <div className={styles.titleRow}>
        <div className={styles.title}>Species</div>
        {selectedTaxa && <Button
          className={styles.close}
          handleClick={clearSelection}
          label="Clear Selection"
        />}
      </div>
      <div className={styles.taxaList}>
        {taxaList?.map((taxa, index) => {
          return (
            <div className={styles.title} key={index} onClick={() => updateSelectedTaxa(taxa.taxa)}>
              <img className={styles.thumb}
                src={`https://mol.org/static/img/groups/taxa_${taxa.taxa}.png`} />
              <div className={styles.header}>
                {taxa.count}&nbsp;{getTaxaTitle(taxa?.title, taxa?.taxa)}
              </div>
            </div>
          )
        })}
      </div>
      {selectedTaxa && selectedTaxaObj && <div className={styles.speciesList}>
        <input type="search" placeholder={`Filter ${selectedTaxa}`} />
        <div className={styles.filterResults}>
          {
            selectedTaxaObj.species.map((sp, index) => {
              return (<div className={styles.speciesBox} key={index}>
                <div className={styles.imgBox}>
                  <img loading="lazy" src={`https://mol.org/static/img/groups/taxa_${selectedTaxaObj.taxa}.png`} />
                </div>
                <div className={cx(styles.speciesText, styles.name)}>
                  <div className={styles.common}>{sp.common}</div>
                  <div className={styles.sci}>{sp.scientificname}</div>
                </div>
              </div>)
            })
          }
        </div>
      </div>
      }
    </div>
  )
}

export default SpeciesListComponent