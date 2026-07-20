import Button from 'components/button';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
import * as print from '@arcgis/core/rest/print.js';
import PrintParameters from '@arcgis/core/rest/support/PrintParameters';

function PrintMapComponent({ view }) {
  const printMap = async () => {
    // const printVM = new PrintViewModel({
    //   view: view, // your MapView instance
    // });
    // // // 1. Generate the standard mapOptions block with the active viewport extent
    // const mapOptions = {
    //   showAttribution: true,
    //   spatialReference: view.spatialReference.toJSON(),
    //   extent: view.extent.toJSON(), // Extracts xmin, ymin, xmax, ymax automatically
    // };

    // // 2. Wrap it inside your structural output payload
    // const finalExportPayload = {
    //   mapOptions: mapOptions,
    //   operationalLayers: view.map.toJSON(), // Loop your layers manually here if needed
    // };

    // console.log('printVM', finalExportPayload);

    const targetLayer = view.map.layers.items[7];
    let targetExtent;

    // 2. Extract geometry extent depending on your layer type
    if (targetLayer?.type === 'graphics' || targetLayer?.type === 'feature') {
      // Query all features/graphics currently in the layer
      const featureSet = await targetLayer.queryFeatures();

      // Calculate the collective bounding envelope of all features
      const geometries = featureSet.features
        .map((f) => f.geometry)
        .filter(Boolean);
      if (geometries.length > 0) {
        // Use geometryEngine to union or calculate the bounding extent
        targetExtent = geometries[0].extent;
        geometries.forEach((geo) => {
          if (geo.extent) targetExtent = targetExtent.union(geo.extent);
        });
      }
    }

    // await view.goTo(
    //   {
    //     target: targetExtent,
    //     zoom: 7.5,
    //     extent: targetExtent.clone(),
    //   },
    //   { animate: true }
    // );

    await view.goTo(
      {
        zoom: 7.5,
      },
      { animate: true }
    );

    const template = new PrintTemplate({
      format: 'pdf',
      layout: 'map-only',
      exportOptions: {
        dpi: 96,
        width: view.width,
        height: view.height,
      },
      preserveScale: false,
    });

    const params = new PrintParameters({
      view: view,
      template: template,
      // Overrides the screen view extent with your custom bounding box geometry
      // printServiceRawParams: {
      //   Web_Map_as_JSON: {
      //     mapOptions: {
      //       extent: targetExtent.toJSON(),
      //       scale: 50000,
      //     },
      //   },
      // },
    });

    const printServiceUrl =
      'https://esri.mapoflife.ai/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task';

    await print.execute(printServiceUrl, params).then((result) => {
      // Handle the result, e.g., open the PDF in a new tab
      window.open(result.url, '_blank');
    });
  };

  return <Button type="rectangular" handleClick={printMap} label="Print Map" />;
}

export default PrintMapComponent;
