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

    await view.goTo(
      {
        target: targetExtent,
        zoom: 7.5,
        extent: targetExtent.clone(),
      },
      { animate: true }
    );

    const tables = [
      {
        id: '19f8b2c3142-layer-2',
        title: 'spi_test_table',
        layerDefinition: { definitionExpression: '1=1' },
        url: 'https://esri.mapoflife.ai/server/rest/services/Hosted/spi_test_table/FeatureServer/0',
      },
    ];

    const myCustomTables = [
      {
        id: '19f8b2c3142-layer-2',
        title: 'spi_test_table',
        layerDefinition: {
          name: 'spi_test_table',
          type: 'Table',
          geometryType: null,
          objectIdField: 'objectid',
          fields: [
            { name: 'objectid', type: 'esriFieldTypeOID', alias: 'OBJECTID' },
            {
              name: 'name',
              type: 'esriFieldTypeString',
              alias: 'name',
              length: 256,
            },
            { name: 'spi', type: 'esriFieldTypeDouble', alias: 'spi' },
            {
              name: 'area_protected',
              type: 'esriFieldTypeDouble',
              alias: 'area_protected',
            },
            { name: 'year_', type: 'esriFieldTypeDouble', alias: 'year' },
          ],
        },
        featureSet: {
          features: [
            {
              attributes: {
                objectid: 1,
                name: 'Panama',
                spi: 71,
                area_protected: 31,
                year_: 2025,
              },
            },
          ],
        },
      },
    ];

    const myCustonTableLayer = {
      id: '19f8b2c3142-layer-2',
      title: 'spi_test_table',
      layerType: 'FeatureLayer',
      featureCollection: {
        layers: [
          {
            layerDefinition: {
              name: 'spi_test_table',
              type: 'Table',
              objectIdField: 'objectid',
              fields: [
                {
                  name: 'objectid',
                  type: 'esriFieldTypeOID',
                  alias: 'OBJECTID',
                },
                {
                  name: 'name',
                  type: 'esriFieldTypeString',
                  alias: 'name',
                  length: 256,
                },
                { name: 'spi', type: 'esriFieldTypeDouble', alias: 'spi' },
                {
                  name: 'area_protected',
                  type: 'esriFieldTypeDouble',
                  alias: 'area_protected',
                },
                { name: 'year_', type: 'esriFieldTypeDouble', alias: 'year' },
              ],
            },
            featureSet: {
              features: [
                {
                  attributes: {
                    objectid: 1,
                    name: 'Panama',
                    spi: 71,
                    area_protected: 31,
                    year_: 2025,
                  },
                },
                {
                  attributes: {
                    objectid: 1,
                    name: 'Elise',
                    spi: 1,
                    area_protected: 3100,
                    year_: 2025,
                  },
                },
                {
                  attributes: {
                    objectid: 1,
                    name: 'Kalkidan',
                    spi: 50,
                    area_protected: 4000,
                    year_: 2025,
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const blah = {
      operationalLayers: [
        ...view.map.toJSON().operationalLayers,
        myCustonTableLayer,
      ],
      // tables: myCustomTables,
      mapOptions: { extent: { ...targetExtent.toJSON() } },
      exportOptions: {
        dpi: 96,
      },
      format: 'pdf',
      layout: 'spi_report_test',
      layoutOptions: {
        customTextElements: [
          { name: 'Panama' },
          { Date: '7/22/2026, 3:34:04 PM' },
        ],
        elementOverrides: {},
        scaleBarOptions: {
          metricUnit: 'esriKilometers',
          metricLabel: 'km',
          nonMetricUnit: 'esriMiles',
          nonMetricLabel: 'mi',
        },
        legendOptions: { operationalLayers: [] },
      },
      reportOptions: {
        reportSectionOverrides: {
          'Species Protection Index': {
            name: '',
            title: 'spi_test_table',
            sourceId: '19f8b2c3142-layer-2',
            isDsOutputDs: false,
          },
        },
      },
    };

    const template = new PrintTemplate({
      format: 'pdf',
      layout: 'spi_report_test',
      layoutOptions: {
        customTextElements: [
          {
            name: 'Panama',
          },
        ],
      },
      report: 'SPI_Summaries',
      showLabels: true,
      includeTables: true,
    });

    const params = new PrintParameters({
      view: view,
      template: template,
      // Overrides the screen view extent with your custom bounding box geometry
      extraParameters: {
        Web_Map_as_JSON: JSON.stringify(blah),
      },
    });

    const printServiceUrl =
      'https://esri.mapoflife.ai/server/rest/services/spireportest/GPServer/spireport';
    // 'https://esri.mapoflife.ai/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task';

    await print.execute(printServiceUrl, params).then((result) => {
      // Handle the result, e.g., open the PDF in a new tab
      window.open(result.url, '_blank');
    });
  };

  return <Button type="rectangular" handleClick={printMap} label="Print Map" />;
}

export default PrintMapComponent;
