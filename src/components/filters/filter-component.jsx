import React, { useContext, useEffect, useState } from 'react';

import { useT } from '@transifex/react';
import { Modal } from 'he-components';
import DoneIcon from '@mui/icons-material/Done';
import { Chip } from '@mui/material';
import cx from 'classnames';
import { LightModeContext } from 'context/light-mode';
import { Loading } from 'he-components';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import Button from 'components/button';

import hrTheme from 'styles/themes/hr-theme.module.scss';

import styles from './filter-component-styles.module.scss';

function FilterComponent(props) {
  const t = useT();
  const {
    setFilteredTaxaList,
    selectedTaxa,
    taxaList,
    filters,
    setFilters,
    isLoading,
    updateActiveFilter,
    flaggedSpecies,
  } = props;

  const [anyActive, setAnyActive] = useState(false);
  const { lightMode } = useContext(LightModeContext);
  const [showFlaggedSpecies, setShowFlaggedSpecies] = useState(false);
  const [flaggedSpeciesToReview, setFlaggedSpeciesToReview] = useState([]);

  const clearCounts = () => {
    setFilteredTaxaList([]);
    const updatedFilters = [...filters];
    updatedFilters.forEach((f) => {
      const innerFilter = f;
      innerFilter.filters.forEach((ff) => {
        const filter = ff;
        filter.count = 0;
      });
    });

    setFilters(updatedFilters);
  };

  const refreshCounts = () => {
    clearCounts();

    let allTaxa = taxaList;
    if (selectedTaxa) {
      allTaxa = allTaxa.filter((taxa) => taxa.taxa === selectedTaxa);
    }

    const filtered = [];
    // allTaxa.species = [];
    let isAnyActive = false;

    filters.forEach((f) =>
      f.filters.forEach((ff) => {
        if (ff.active) isAnyActive = true;
      })
    );
    // TODO: FIGURE OUT FILTERS
    allTaxa.forEach((taxa) => {
      // Object.values(allTaxa).forEach((taxa) => {
      const candidateTaxa = { ...taxa };
      const candidateSpecies = [];
      taxa.species.forEach((species) => {
        const speciesFilters = [];
        const speciesOrFilters = [];
        filters.forEach((filterGroup) => {
          filterGroup.filters.forEach((filter) => {
            const result = filter.test(species);
            filter.result = result;
            if (isAnyActive && filter.active) {
              if (filter.type === 'and') {
                speciesFilters.push(result);
              } else if (filter.type === 'or') {
                speciesOrFilters.push(result);
              }
            }
          });
        });
        const allAnd =
          speciesFilters.every((x) => x) && speciesFilters.length > 0;
        const anyOr = speciesOrFilters.includes(true);
        if (!isAnyActive) {
          candidateSpecies.push(species);
          // only ands
        } else if (allAnd && speciesOrFilters.length === 0) {
          candidateSpecies.push(species);
          // only or's
        } else if (speciesFilters.length === 0 && anyOr) {
          candidateSpecies.push(species);
        } else if (allAnd && anyOr) {
          candidateSpecies.push(species);
        }

        const onAnd = allAnd || speciesFilters.length === 0;

        filters.forEach((filterGroup) => {
          filterGroup.filters.forEach((filter) => {
            if (onAnd && filter.result) {
              filter.count += 1;
            }
          });
        });
      });

      candidateTaxa.species = candidateSpecies;
      candidateTaxa.count = candidateSpecies.length;
      filtered.push(candidateTaxa);
    });

    setAnyActive(isAnyActive);
    setFilteredTaxaList(filtered);
  };

  const activateFilter = (filter) => {
    updateActiveFilter(filter);
    refreshCounts();
  };

  const handleFlagFeedback = () => {
    console.log('handle flag feedback', flaggedSpecies);
  };

  const clearFilters = () => {
    filters.forEach((f) =>
      f.filters.forEach((ff) => {
        ff.active = false;
      })
    );
    refreshCounts();
  };

  const updateSpecies = (scientificName) => {
    setFlaggedSpeciesToReview(prev => prev.map(s => s.scientificname === scientificName ? { ...s, checked: !s.checked } : s));
  };

  useEffect(() => {
    if (flaggedSpecies) {
      setFlaggedSpeciesToReview(flaggedSpecies?.map((species) => ({
        ...species,
          checked: false,
      })));
    }
  }, [flaggedSpecies]);

  useEffect(() => {
    if (!taxaList) return;
    refreshCounts();
  }, [taxaList]);

  useEffect(() => {
    refreshCounts();
  }, [selectedTaxa]);

  return (
    <div className={cx(lightMode ? styles.light : '', styles.filters)}>
      <div className={styles.titleRow}>
        <div className={styles.title}>{t('Filters')}</div>
        {anyActive && (
          <Button
            className={styles.close}
            handleClick={clearFilters}
            label={t('Clear Filters')}
          />
        )}
      </div>
      <hr className={hrTheme.dark} />
      {isLoading && <Loading height={200} />}
      {!isLoading &&
        filters.map((filterGroup) => {
          return (
            <div className={styles.filterList} key={filterGroup.title}>
              <div className={styles.filterGroupTitle}>
                {t(filterGroup.title)}
              </div>
              <div className={styles.filterbox}>
                {filterGroup.filters.map((filter) => {
                  return (
                    filter.count > 0 && <Chip
                      key={filter.name}
                      icon={filter.active ? <DoneIcon /> : <span />}
                      color={filter.active ? 'success' : 'primary'}
                      label={`${t(filter.name)}: ${filter.count}`}
                      onClick={() => activateFilter(filter)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      {flaggedSpecies?.length > 0 && (
        <Button
          className={styles.viewFlaggedButton}
          type="rectangular"
          label={t('View flagged species')}
          handleClick={() => setShowFlaggedSpecies(true)}
        />
      )}
      <Modal
        isOpen={showFlaggedSpecies}
        onRequestClose={() => setShowFlaggedSpecies(false)}
        theme={styles}>
          <article className={styles.feedbackContent}>
            <div className={styles.feedbackHeader}>
              <span className={styles.feedbackTitle}>{t('Flagged Species')}</span>
              <span className={styles.feedbackSubtitle}>{t('These are the species that have been flagged for review.')}</span>
            </div>
            <div className={styles.feedbackBody}>
              {flaggedSpeciesToReview?.map((species) => (
                <div key={`flagged-${species.scientificName}`} className={styles.flaggedSpeciesItem}>
                  <FormControlLabel
                    label={t(species.scientificname)}
                    control={
                      <Checkbox
                        checked={species.checked}
                        onChange={() => updateSpecies(species.scientificname)}
                      />
                    }
                  />
                  <span className={styles.flagReason}>{t('Flagged by:')} {species.user_name}</span>
                </div>
              ))}
            </div>
            <div className={styles.feedbackFooter}>
              <Button className={styles.cancelButton} label={t('Cancel')} handleClick={() => setShowFlaggedSpecies(false)} />

              <Button
                className={styles.rejectButton}
                type="rectangular"
                label={t('Unflag Species')}
                handleClick={handleFlagFeedback}
              />
              <Button
                className={styles.submitButton}
                type="rectangular"
                label={t('Approve Flagged Species')}
                handleClick={handleFlagFeedback}
              />
            </div>
          </article>
      </Modal>
    </div>
  );
}

export default FilterComponent;
