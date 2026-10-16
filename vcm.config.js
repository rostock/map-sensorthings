export default {
  appConfig: {
    modules: [
      {
        _id: 'fc1e46f8-8ckl-40d3-a1f4-d83cc5bea37s',
        name: 'Sensothings Plugin',
        startingViewpointName: 'Hamburg',
        startingMapName: 'CesiumMap',
        maps: [
          {
            type: 'CesiumMap',
            name: 'CesiumMap',
          },
          {
            type: 'OpenlayersMap',
            name: 'OpenlayersMap',
          },
        ],
        i18n: [
          {
            name: 'sensorthings',
            nl: {
              footer: {
                title: 'nl-test',
              },
            },
            uz: {
              footer: {
                title: 'uz-test',
              },
            },
          },
        ],
        viewpoints: [
          {
            type: 'Viewpoint',
            name: 'Hamburg',
            groundPosition: [9.969052075556158, 53.53114964656281, 0],
            distance: 24604.86,
            heading: 62.96,
            pitch: -34.5,
            roll: 0,
            animate: false,
          },
          {
            type: 'Viewpoint',
            name: 'Hof',
            groundPosition: [11.849823506176246, 50.18446841017884, 0],
            distance: 6067.86,
            heading: 0,
            pitch: -30.63,
            roll: 0,
            animate: false,
          },
        ],
        layers: [
          {
            name: 'OpenStreetMapLayer(1)',
            url: 'https://osm.virtualcitymap.de/mapproxy/wmts/osm/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png',
            type: 'WMTSLayer',
            datasourceId: '2jEtgBemjJaSNx3AH',
            activeOnStartup: true,
            layer: 'osm',
            wmtsStyle: 'default',
            format: 'image/png',
            tileMatrixSetID: 'osm_grid',
            tileMatrixPrefix: '',
            maxLevel: 19,
            tilingSchema: 'mercator',
            extent: {
              coordinates: [-180, -85, 180, 85],
              projection: {
                epsg: 'EPSG:4326',
              },
            },
            opacity: '1',
            hiddenObjectIds: [],
            numberOfLevelZeroTilesX: 1,
            numberOfLevelZeroTilesY: 1,
            exclusiveGroups: ['base'],
            properties: {
              title: 'OpenStreetMap',
              showInOverviewMap: true,
              attributions: {
                provider: 'OpenStreetMap contributors',
                url: 'http://www.openstreetmap.org/',
                year: '2019',
              },
            },
          },
          {
            type: 'SensorThingsLayer',
            name: 'Chart Layer',
            url: 'https://iot.hamburg.de/v1.1',
            observedProperty: 'Anzahl verfügbarer Fahrräder',
            zIndex: 100,
            extent: {
              coordinates: [9.924792, 53.55303, 9.9385915, 53.565636],
              projection: {
                epsg: 4326,
              },
            },
            properties: {
              featureInfo: 'ChartFeatureInfoView',
            },
            activeOnStartup: true,
          },
          {
            type: 'SensorThingsLayer',
            name: 'Chart Balloon Layer',
            url: 'https://iot.hamburg.de/v1.1',
            moreInformationLink:'https://google.com',
            observedProperty: 'Anzahl verfügbarer Fahrräder',
            zIndex: 100,
            extent: {
              coordinates: [9.9385915, 53.55303, 9.952391, 53.565636],
              projection: {
                epsg: 4326,
              },
            },
            properties: {
              featureInfo: 'ChartBalloonFeatureInfoView',
            },
            activeOnStartup: true,
          },
          {
            type: 'SensorThingsLayer',
            name: 'Dashboard Layer',
            url: 'https://iot.hamburg.de/v1.1',
            moreInformationLink:'https://google.com',
            observedProperty: 'Anzahl verfügbarer Fahrräder',
            zIndex: 100,
            extent: {
              coordinates: [9.959938, 53.491391, 9.9958145, 53.519287],
              projection: {
                epsg: 4326,
              },
            },
            properties: {
              featureInfo: 'DashboardFeatureInfoView',
            },
            activeOnStartup: true,
          },
          {
            type: 'SensorThingsLayer',
            name: 'Dashboard Balloon Layer',
            url: 'https://iot.hamburg.de/v1.1',
            moreInformationLink:'https://google.com',
            observedProperty: 'Anzahl verfügbarer Fahrräder',
            zIndex: 100,
            extent: {
              coordinates: [9.9958145, 53.491391, 10.031691, 53.519287],
              projection: {
                epsg: 4326,
              },
            },
            properties: {
              featureInfo: 'DashboardBalloonFeatureInfoView',
            },
            activeOnStartup: true,
          },
        ],
        featureInfo: [
          {
            type: 'ChartFeatureInfoView',
            name: 'ChartFeatureInfoView',
            window: {
              position: {
                width: '400px',
              },
            },
            initialDayObservationRange: 7,
          },
          {
            type: 'ChartBalloonFeatureInfoView',
            name: 'ChartBalloonFeatureInfoView',
            initialDayObservationRange: 7,
          },
          {
            type: 'DashboardFeatureInfoView',
            name: 'DashboardFeatureInfoView',
            url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.004017949104309083%2C51.47612752641776%2C0.00030577182769775396%2C51.478569861898606&layer=',
            thingDashboardMapping: [
              [93, 'mapnik'],
              [66, 'cyclosm'],
              [39, 'transportmap'],
            ],
            window: {
              position: {
                height: '400px',
              },
            },
          },
          {
            type: 'DashboardBalloonFeatureInfoView',
            name: 'DashboardBalloonFeatureInfoView',
            thingDashboardMapping: [
              [85, 'https://example.org'],
              [86, 'https://example.org'],
              [77, 'https://example.org'],
            ],
            window: {
              position: {
                height: '400px',
              },
            },
          },
        ],
        contentTree: [
          {
            type: 'LayerContentTreeItem',
            name: 'OpenStreetMapLayer(1)',
            layerName: 'OpenStreetMapLayer(1)',
          },
          {
            type: 'ViewpointContentTreeItem',
            name: 'Hamburg',
            viewpointName: 'Hamburg',
          },
          {
            type: 'ViewpointContentTreeItem',
            name: 'Hof',
            viewpointName: 'Hof',
          },
        ],
        plugins: [
          {
            name: '@vcmap-show-case/plugin-editors',
            entry: 'plugins/@vcmap-show-case/plugin-editors/index.js',
          },
        ],
      },
    ],
  },
};
