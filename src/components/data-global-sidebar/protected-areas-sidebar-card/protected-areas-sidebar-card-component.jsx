import React, { useState } from 'react';
import cx from 'classnames';
import { WDPALayers, TEXTS } from 'constants/protected-areas';
import { LAYERS_CATEGORIES } from 'constants/mol-layers-configs';
import CategoryBox from 'components/category-box';
import LayerToggle from 'components/layer-toggle';
import SourceAnnotation from 'components/source-annotation';
import styles from './protected-areas-sidebar-card-styles.module.scss'
import hrTheme from 'styles/themes/hr-theme.module.scss';
import checkboxTheme from 'styles/themes/checkboxes-theme.module.scss';
import ExistingProtectionThumbnail from 'images/existing-protection.png';
const protectedAreas = LAYERS_CATEGORIES.PROTECTION;

const ProtectedAreasSidebarCardComponent = ({
  map,
  source,
  selectedLayers,
  handleLayerToggle,
  countedActiveLayers,
}) => {
  const [isOpen, setOpen] = useState(false)
  const handleBoxClick = () => setOpen(!isOpen);
  return (
    <div className={styles.sidebarCardContainer}>
      <CategoryBox
        image={ExistingProtectionThumbnail}
        title={TEXTS.categoryTitle}
        counter={countedActiveLayers[protectedAreas]}
        handleBoxClick={handleBoxClick}
        isOpen={isOpen}
      />
      <div
        className={cx(styles.layersTogglesContainer, { [styles.open]: isOpen })}
      >
        <span className={styles.description}>{TEXTS.description}</span>
        <hr className={hrTheme.dark}/>
        <span className={styles.layersTitle}>{TEXTS.layersTitle}</span>
        {WDPALayers.map(layer => (
          <LayerToggle
            map={map}
            type='checkbox'
            theme={checkboxTheme.protectedAreas}
            optionsSelected={selectedLayers}
            option={layer}
            title='my title'
            handleInfoClick={() => console.log('info clicked')}
            onClick={handleLayerToggle}
          />
        ))}
        <SourceAnnotation
          theme='light'
          metaDataSources={source}
        />
      </div>
    </div>
  );
}

export default ProtectedAreasSidebarCardComponent;