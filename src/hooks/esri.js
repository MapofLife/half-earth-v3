/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';

import { loadModules } from 'esri-loader';

import { calculateGeometryArea } from 'utils/analyze-areas-utils';

import { LAYERS_URLS } from 'constants/layers-urls';

// Load watchUtils module to follow esri map changes
export const useWatchUtils = () => {
  const [watchUtils, setWatchUtils] = useState(null);
  useEffect(() => {
    loadModules(['esri/core/watchUtils']).then(([loadedWatchUtils]) => {
      setWatchUtils(loadedWatchUtils);
    });
  }, []);
  return watchUtils;
};

export const useFeatureLayer = ({ layerSlug, outFields = ['*'] }) => {
  const [layer, setLayer] = useState(null);
  useEffect(() => {
    loadModules(['esri/layers/FeatureLayer']).then(([FeatureLayer]) => {
      const updatedLayer = new FeatureLayer({
        url: LAYERS_URLS[layerSlug],
        outFields,
      });
      setLayer(updatedLayer);
    });
  }, []);
  return layer;
};

export const useSearchWidgetLogic = (
  view,
  searchTermsAnalyticsEvent,
  searchWidgetConfig,
  isSimpleSearch
) => {
  const [searchWidget, setSearchWidget] = useState(null);
  const { searchSources, postSearchCallback, searchResultsCallback } =
    searchWidgetConfig || {};
  const [esriConstructors, setEsriConstructors] = useState();

  useEffect(() => {
    loadModules([
      'esri/widgets/Search',
      'esri/layers/FeatureLayer',
      'esri/tasks/Locator',
    ])
      .then(([Search, FeatureLayer, Locator]) => {
        setEsriConstructors({ Search, FeatureLayer, Locator });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleOpenSearch = () => {
    if (!esriConstructors) return null;
    const { Search, FeatureLayer, Locator } = esriConstructors;
    if (searchWidget === null) {
      const sWidget = new Search({
        view,
        locationEnabled: true,
        // do not show the Use current location box when clicking in the input field
        popupEnabled: false, // hide location popup
        resultGraphicEnabled: false, // hide location pin
        sources: !isSimpleSearch && searchSources(FeatureLayer, Locator),
        includeDefaultSources: isSimpleSearch,
        goToOverride: isSimpleSearch ? undefined : () => {}, // Go to will be done on the callback
      });
      setSearchWidget(sWidget);
    }
    return undefined;
  };

  const updateSources = (searchSourcesFunction) => {
    if (searchWidget) {
      const { FeatureLayer, Locator } = esriConstructors;
      searchWidget.sources = searchSourcesFunction(FeatureLayer, Locator);
    }
  };

  const handleCloseSearch = () => {
    setSearchWidget(null);
  };

  const handleSearchInputChange = (event) => {
    if (searchWidget) {
      searchWidget.suggest(event.target.value);
    }
  };

  const handleSearchSuggestionClick = (option) => {
    if (searchWidget) {
      searchWidget.search(option);
    }
  };

  useEffect(() => {
    if (searchWidget && searchWidgetConfig) {
      searchWidget.on('suggest-complete', searchResultsCallback);
      searchWidget.on('select-result', postSearchCallback);
    }
  }, [searchWidget]);

  return {
    updateSources,
    handleOpenSearch,
    handleCloseSearch,
    handleSearchInputChange,
    handleSearchSuggestionClick,
    searchWidget,
  };
};

export const useSketchWidget = (
  view,
  setDrawWidgetRef,
  sketchWidgetConfig = {}
) => {
  const [sketchTool, setSketchTool] = useState(null);
  const [sketchLayer, setSketchLayer] = useState(null);
  const { postDrawCallback } = sketchWidgetConfig;
  const [Constructors, setConstructors] = useState(null);
  const [geometryArea, setGeometryArea] = useState(0);

  useEffect(() => {
    loadModules([
      'esri/widgets/Sketch/SketchViewModel',
      'esri/geometry/geometryEngine',
    ]).then(([SketchViewModel, geometryEngine]) => {
      setConstructors({
        geometryEngine,
        SketchViewModel,
      });
    });
  }, []);

  const handleSketchToolActivation = () => {
    loadModules([
      'esri/widgets/Sketch',
      'esri/widgets/Sketch/SketchViewModel',
      'esri/layers/GraphicsLayer',
    ]).then(([Sketch, SketchViewModel, GraphicsLayer]) => {
      const _sketchLayer = new GraphicsLayer({
        elevationInfo: { mode: 'on-the-ground' },
      });
      setSketchLayer(_sketchLayer);
      view.map.add(_sketchLayer);
      const _sketchTool = new Sketch({
        view,
        layer: _sketchLayer,
        visibleElements: {
          settingsMenu: false,
        },
        createTools: {
          point: false,
        },
        availableCreateTools: ['polygon', 'rectangle', 'circle'],
        viewModel: new SketchViewModel({
          view,
          layer: _sketchLayer,
          defaultCreateOptions: { hasZ: false },
          defaultUpdateOptions: {
            enableZ: false,
            multipleSelectionEnabled: false,
            toggleToolOnClick: true,
          },
          polygonSymbol: {
            type: 'simple-fill',
            color: [147, 255, 95, 0.2],
          },
        }),
      });
      setSketchTool(_sketchTool);
    });
  };

  const addWidgetToTheUi = () => {
    view.ui.add(sketchTool, 'manual');
    sketchTool.when(() => {
      const widgetRef =
        // eslint-disable-next-line no-undef
        document.getElementsByClassName('esri-sketch__panel') &&
        // eslint-disable-next-line no-undef
        document.getElementsByClassName('esri-sketch__panel')[0];
      setDrawWidgetRef(widgetRef);
    });

    // eslint-disable-next-line no-undef
    const container = document.createElement('div');
    // eslint-disable-next-line no-undef
    const rootNode = document.getElementById('root');
    rootNode.appendChild(container);
  };

  const handleSketchToolDestroy = () => {
    view.ui.remove(sketchTool);
    setSketchTool(null);
    sketchTool.destroy();
  };

  useEffect(() => {
    if (sketchTool) {
      addWidgetToTheUi();
      sketchTool.on('create', (event) => {
        if (event.state === 'active') {
          if (event.graphic.geometry.rings[0].length > 3) {
            setGeometryArea(
              calculateGeometryArea(
                event.graphic.geometry,
                Constructors.geometryEngine
              )
            );
          }
        } else if (event.state === 'complete') {
          setGeometryArea(0);
          postDrawCallback(
            sketchLayer,
            event.graphic,
            calculateGeometryArea(
              event.graphic.geometry,
              Constructors.geometryEngine
            )
          );
        }
      });
    }

    return function cleanUp() {
      if (sketchLayer) {
        view.map.remove(sketchLayer);
      }
    };
  }, [sketchTool]);

  return {
    sketchTool,
    geometryArea, // TODO: Not used for now. Remove if not needed
    handleSketchToolDestroy,
    handleSketchToolActivation,
  };
};
