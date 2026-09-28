import type { VcsPlugin, VcsUiApp, PluginConfigEditor } from '@vcmap/ui';
import { moduleIdSymbol } from '@vcmap/core';
import { name, version, mapVersion } from '../package.json';
import { SensorThingsLayer } from './sensorThingsLayer.js';
import ChartFeatureInfoView from './chartFeatureInfoView.js';
import DashboardFeatureInfoView from './dashboardFeatureInfoView.js';
import ChartBalloonFeatureInfoView from './chartBalloonFeatureInfoView.js';
import DashboardBalloonFeatureInfoView from './dashboardBalloonFeatureInfoView.js';
import FeatureInfoEditor from './editors/FeatureInfoEditor.vue';
import SensorthingsLayerEditor from './editors/SensorthingsLayerEditor.vue';

export default function plugin(): VcsPlugin<
  Record<never, never>,
  Record<never, never>
> {
  let app: VcsUiApp;
  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    async initialize(vcsUiApp: VcsUiApp): Promise<void> {
      app = vcsUiApp;
      vcsUiApp.layerClassRegistry.registerClass(
        this[moduleIdSymbol],
        SensorThingsLayer.className,
        SensorThingsLayer,
      );
      vcsUiApp.featureInfoClassRegistry.registerClass(
        this[moduleIdSymbol],
        ChartFeatureInfoView.className,
        ChartFeatureInfoView,
      );
      vcsUiApp.featureInfoClassRegistry.registerClass(
        this[moduleIdSymbol],
        ChartBalloonFeatureInfoView.className,
        ChartBalloonFeatureInfoView,
      );
      vcsUiApp.featureInfoClassRegistry.registerClass(
        this[moduleIdSymbol],
        DashboardFeatureInfoView.className,
        DashboardFeatureInfoView,
      );
      vcsUiApp.featureInfoClassRegistry.registerClass(
        this[moduleIdSymbol],
        DashboardBalloonFeatureInfoView.className,
        DashboardBalloonFeatureInfoView,
      );

      return Promise.resolve();
    },
    /**
     * components for configuring the plugin and/ or custom items defined by the plugin
     */
    getConfigEditors(): PluginConfigEditor<object>[] {
      return [
        {
          component: FeatureInfoEditor,
          collectionName: 'featureInfo',
          itemName: ChartFeatureInfoView.className,
          title: 'sensorthings.editors.title.chart',
          infoUrlCallback: app?.getHelpUrlCallback(
            '/components/plugins/sensorthingsConfig.html#id_chartFeatureInfo',
            'app-configurator',
          ),
        },
        {
          component: FeatureInfoEditor,
          collectionName: 'featureInfo',
          itemName: ChartBalloonFeatureInfoView.className,
          title: 'sensorthings.editors.title.chartBalloon',
          infoUrlCallback: app?.getHelpUrlCallback(
            '/components/plugins/sensorthingsConfig.html#id_chartBalloonFeatureInfo',
            'app-configurator',
          ),
        },
        {
          component: FeatureInfoEditor,
          collectionName: 'featureInfo',
          itemName: DashboardFeatureInfoView.className,
          title: 'sensorthings.editors.title.dashboard',
          infoUrlCallback: app?.getHelpUrlCallback(
            '/components/plugins/sensorthingsConfig.html#id_dashboardFeatureInfo',
            'app-configurator',
          ),
        },
        {
          component: FeatureInfoEditor,
          collectionName: 'featureInfo',
          itemName: DashboardBalloonFeatureInfoView.className,
          title: 'sensorthings.editors.title.dashboardBalloon',
          infoUrlCallback: app?.getHelpUrlCallback(
            '/components/plugins/sensorthingsConfig.html#id_dashboardBalloonFeatureInfo',
            'app-configurator',
          ),
        },
        {
          component: SensorthingsLayerEditor,
          collectionName: 'layers',
          itemName: SensorThingsLayer.className,
          title: 'sensorthings.editors.title.sensorthingsLayer',
          infoUrlCallback: app?.getHelpUrlCallback(
            '/components/plugins/sensorthingsConfig.html#id_sensorThingsLayer',
            'app-configurator',
          ),
        },
      ];
    },
    destroy(): void {
      app.layerClassRegistry.unregisterClass(
        this[moduleIdSymbol],
        SensorThingsLayer.className,
      );
      [
        ChartFeatureInfoView.className,
        ChartBalloonFeatureInfoView.className,
        DashboardFeatureInfoView.className,
        DashboardBalloonFeatureInfoView.className,
      ].forEach((className) => {
        app.featureInfoClassRegistry.unregisterClass(
          this[moduleIdSymbol],
          className,
        );
      });
    },
    i18n: {
      en: {
        sensorthings: {
          from: 'From',
          to: 'To',
          id: 'Thing ID',
          name: 'Thing name',
          observedProperty: 'Observed property',
          latestObservation: 'Latest observation',
          limitedObservations:
            'Number of observations reached limit of: {maxObservations} for "{datastream}". Only the first {maxObservations} observations are shown.',
          noObservations:
            'No data was found for “{datastream}” for the selected time period. Please adjust time span using input elements.',
          sensor: 'Sensor',
          chart: {
            time: 'Time',
            count: 'Count',
          },
          dashboard: {
            openInNewTab: 'Open dashboard in new tab',
          },
          editors: {
            title: {
              chart: 'Sensorthings chart view - Editor',
              chartBalloon: 'Sensorthings popup (balloon) chart view - Editor',
              dashboard: 'Sensorthings dashboard view - Editor',
              dashboardBalloon:
                'Sensorthings popup (balloon) dashboard view - Editor',
              sensorthingsLayer: 'SensorThings layer',
            },
            dashboard: {
              title: 'Dashboard settings',
              url: 'URL',
              unique: 'ID must be unique',
              delete: 'Delete entry',
              deleteAll: 'Delete all entries',
              uploadEntries: 'Upload entries from a CSV file',
              importFeedback: `Filtered {numberInvalid} row(s) due to invalid data and {numberDublicate} row(s) due to dublicates.`,
              dashboardUrl: 'Dashboard URL (path)',
              editQueryParams: 'Edit query parameter',
              queryParams: 'Query parameter',
              queryKey: 'Key',
              queryValue: 'Value',
              mapping: 'Custom mapping of thing ID to dashboard ID',
              tableNoData: 'No entries yet',
              addEntry: 'Add entry',
            },
            chart: {
              title: 'Chart settings',
              initialDayObservationRange: 'Initial time span (days)',
            },
            csv: {
              options: 'CSV import options',
              hasHeading: 'Has heading',
              encoding: 'Encoding',
              delimiter: 'Delimiter',
              limit:
                'The CSV import is limited to {maximumRows} rows. All rows that exceed this limit will be ignored.',
            },
            layer: {
              noData: 'Provide valid URL first',
              noFilter: 'No filter',
              observedPropertyFilter: 'Observed property filter',
              fetchSuccess: 'URL query was successful.',
              fetchFailed:
                'URL query failed. Please ensure that the URL is correct.',
              additionalFilters: 'Additional filters',
            },
            validation: {
              isNumberGreaterZero: 'Number must be greater zero.',
              validUrl: 'Value must be a valid URL',
            },
          },
        },
      },
      de: {
        sensorthings: {
          from: 'Von',
          to: 'Bis',
          id: 'Thing ID',
          name: 'Name',
          observedProperty: 'Beobachtetes Merkmal',
          latestObservation: 'Letzte Beobachtung',
          limitedObservations:
            'Anzahl der Beobachtungen erreicht Limit von: {maxObservations} für "{datastream}". Nur die ersten {maxObservations} Beobachtungen werden angezeigt.',
          noObservations:
            'Für die ausgewählte Zeitspanne wurden keine Daten für "{datastream}" gefunden. Bitte passen Sie die Zeitspanne über die Eingabeelemente an.',
          sensor: 'Sensor',
          chart: {
            time: 'Zeit',
            count: 'Anzahl',
          },
          dashboard: {
            openInNewTab: 'Dashboard in neuem Tab öffnen',
          },
          editors: {
            title: {
              chart: 'Sensorthings Diagramm Darstellung - Editor',
              chartBalloon:
                'Sensorthings Popup-Darstellung (Balloon) Diagramm - Editor',
              dashboard: 'Sensorthings Dashboard Darstellung - Editor',
              dashboardBalloon:
                'Sensorthings Popup-Darstellung (Balloon) Dashboard - Editor',
              sensorthingsLayer: 'SensorThings Ebene',
            },
            dashboard: {
              title: 'Dashboard Einstellungen',
              url: 'URL',
              unique: 'ID muss einzigartig sein',
              delete: 'Eintrag löschen',
              deleteAll: 'Alle Einträge löschen',
              uploadEntries: 'Einträge aus CSV Datei hochladen',
              importFeedback: `Es wurden {numberInvalid} Zeile(n) auf Grund von ungültigen Werten und {numberDublicate} Zeile(n) auf Grund von Duplikaten herausgefiltert.`,
              dashboardUrl: 'Dashboard URL (Pfad)',
              editQueryParams: 'Abfrage Parameter bearbeiten',
              queryParams: 'Abfrage Parameter',
              queryKey: 'Schlüssel',
              queryValue: 'Wert',
              mapping: 'Manuelle Zuordnung von Thing-ID zu Dashboard-ID',
              tableNoData: 'Bisher keine Einträge',
              addEntry: 'Eintrag hinzufügen',
            },
            chart: {
              title: 'Diagramm Einstellungen',
              initialDayObservationRange: 'Initialer Zeitraum in Tagen',
            },
            csv: {
              options: 'CSV Import Optionen',
              hasHeading: 'Hat Überschriften',
              encoding: 'Zeichencodierung',
              delimiter: 'Trennzeichen',
              limit:
                'Der CSV Import is auf {maximumRows} Zeilen begrenzt. Alle Zeilen die dieses Limit überschreiten werden nicht importiert.',
            },
            layer: {
              noData: 'Erst valide URL bereistellen',
              noFilter: 'Kein Filter',
              observedPropertyFilter: 'Beobachtetes Merkmal Filter',
              fetchSuccess: 'Test-Abfrage der URL war erfolgreich.',
              fetchFailed:
                'Test-Abfrage hat fehlgeschlagen. Stellen Sie sicher, dass die URL korrekt ist.',
              additionalFilters: 'Zusätzliche Filter',
            },
            validation: {
              isNumberGreaterZero: 'Zahl muss größer Null sein.',
              validUrl: 'Wert muss eine valide URL sein',
            },
          },
        },
      },
    },
  };
}
