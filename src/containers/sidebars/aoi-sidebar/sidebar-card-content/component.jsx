import React from 'react';
import ReactMarkdown from 'react-markdown/with-html';
import LayerToggle from 'components/layer-toggle';
import { ReactComponent as WarningIcon } from 'icons/warning.svg';
import { SIDEBAR_CARDS_CONFIG } from 'constants/analyze-areas-constants';
import Legend from 'containers/sidebars/sidebar-legend';
import SourceAnnotation from 'components/source-annotation';
import SidebarCardWrapper from 'containers/sidebars/sidebar-card-wrapper';
import styles from './styles.module.scss';

const Component = ({
  map,
  layers,
  onChange,
  hasLegend,
  cardTitle,
  toggleType,
  cardCategory,
  activeLayers,
  cardDescription,
  displayWarning,
  percentageUnderPressure,
}) => (
  <SidebarCardWrapper className={styles.cardWrapper}>
    <div>
      <p className={styles.title}>{cardTitle}</p>
      {hasLegend && <Legend legendItem={cardCategory} className={styles.legendContainer}/>}
      <ReactMarkdown 
        className={styles.description}
        source={cardDescription}
      />
      <SourceAnnotation
        theme='dark'
        metaDataSources={' WDPA, OECM & RAISG.'}
        className={styles.sourceContainer}
      />
    </div>
    {displayWarning ? 
    <div className={styles.warningWrapper}>
      <WarningIcon className={styles.warning} />
      <ReactMarkdown 
        className={styles.description}
        source={SIDEBAR_CARDS_CONFIG[cardCategory].warning}
      /> 
    </div>:
      <div className={styles.togglesContainer}>
        {layers.map(layer => (
          <LayerToggle
            map={map}
            variant='dark'
            option={layer}
            key={layer.value}
            type={toggleType}
            onChange={onChange}
            toggleCategory={cardCategory}
            activeLayers={activeLayers}
          />
        ))}
      </div>
    }
  </SidebarCardWrapper>
)

export default Component;