import React, { useState } from 'react';
import SourceAnnotation from 'components/source-annotation';
import cx from 'classnames';
import { LAYERS_CATEGORIES } from 'constants/mol-layers-configs';
import Tabs from 'components/tabs';
import Dropdown from 'components/dropdown';
import CategoryBox from 'components/category-box';
import SidebarCardWrapper from 'components/sidebar-card-wrapper'
import SidebarCardContent from 'components/sidebar-card-content';
import LayerToggle from 'components/layer-toggle';
import Legend from 'components/sidebar-legend';
import { BIODIVERSITY_TABS } from 'constants/ui-params';
import { BIODIVERSITY_SLUG } from 'constants/legend-configs';
import { LAYERS_TOGGLE_CONFIG, LAYERS_RESOLUTION, TERRESTRIAL, MARINE, RESOLUTIONS } from 'constants/biodiversity-layers-constants';
import styles from './biodiversity-sidebar-card-styles.module.scss';

import BiodiversityThumbnail from "images/biodiversity.png";

const BiodiversitySidebarCardComponent = ({
  activeLayers,
  countedActiveLayers,
  handleLayerToggle,
  selectedLayer,
  view,
  map,
  handleTabSelection,
  handleOptionSelection,
  biodiversityLayerVariant,
  cardMetadata
}) => {
  const { title, description, source } = cardMetadata || {};
  const [selectedResolution, setSelectedResolution] = useState({[TERRESTRIAL]: RESOLUTIONS.LOW.slug, [MARINE]: RESOLUTIONS.LOW.slug})
  const [isOpen, setOpen] = useState(false);
  const handleBoxClick = () => setOpen(!isOpen);
  return (
    <div className={cx(
      styles.sidebarCardContainer,
      { [styles.open]: isOpen }
    )}>
      <CategoryBox
        title={LAYERS_CATEGORIES.BIODIVERSITY}
        image={BiodiversityThumbnail}
        counter={countedActiveLayers[LAYERS_CATEGORIES.BIODIVERSITY]}
        handleBoxClick={handleBoxClick}
        isOpen={isOpen}
      />
      <div
        className={cx(
          styles.layersTogglesContainer,
          styles[`${biodiversityLayerVariant}Tab`],
          { [styles.open]: isOpen }
        )}
      >
        <Legend legendItem={BIODIVERSITY_SLUG} className={styles.legendContainer}/>
        <Tabs
          tabs={BIODIVERSITY_TABS}
          onClick={handleTabSelection}
          className={styles.tabsContainer}
          defaultTabSlug={biodiversityLayerVariant}
        />
        <div className={styles.cardContainer}>
          <SidebarCardWrapper collapsable >
            <SidebarCardContent
              title={title}
              description={description}
            />
          </SidebarCardWrapper>
        </div>
        <div className={styles.dropdownContainer}>
          <span className={styles.dropdownLabel}>Terrestrial species</span>
          <Dropdown
            theme={'dark'}
            options={LAYERS_RESOLUTION[biodiversityLayerVariant][TERRESTRIAL]}
            selectedOption={LAYERS_RESOLUTION[biodiversityLayerVariant][TERRESTRIAL][0]}
            handleOptionSelection={(op) => setSelectedResolution({
              ...selectedResolution,
              [TERRESTRIAL]: op
            })}
            disabled={LAYERS_RESOLUTION[biodiversityLayerVariant][TERRESTRIAL].length < 2}
          />
        </div>
        <div className={styles.togglesContainer}>
          {LAYERS_TOGGLE_CONFIG[biodiversityLayerVariant][TERRESTRIAL][selectedResolution[TERRESTRIAL]].map(layer => (
              <LayerToggle
                map={map}
                type='radio'
                option={layer}
                optionSelected={selectedLayer}
                onChange={handleLayerToggle}
              />
            ))
          }
        </div>
        <SourceAnnotation
          theme='light'
          className={styles.sourceContainer}
          metaDataSources={source}
        />
      </div>
    </div>
  );
};

export default BiodiversitySidebarCardComponent;