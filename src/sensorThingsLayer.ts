import type { VectorTileOptions } from '@vcmap/core';
import {
  parseGeoJSON,
  StaticFeatureTileProvider,
  VectorTileLayer,
} from '@vcmap/core';
import { queryThingsWithLocations } from './sensorThingsAPI.js';

export type SensorThingsOptions = Omit<
  VectorTileOptions,
  'tileProvider' | 'url'
> & {
  url: string;
  observedProperty?: string;
  additionalFilters?: string;
  /** Optional link, e.g. to a specialized application, rendered as button in the feature info. */
  moreInformationLink?: string;
};

export type ThingFeatureProperties = {
  name: string;
} & Record<string, unknown>;

function getSensorIconDataUrl(): string {
  return `data:image/svg+xml,%3Csvg%20width%3D%2240.821%22%20height%3D%2251.946%22%20viewBox%3D%220%200%2010.801%2013.744%22%20xml%3Aspace%3D%22preserve%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20transform%3D%22translate(-1.45)scale(.26)%22%3E%3Cpath%20style%3D%22fill%3A%23fff%3Bstroke%3A%2328a5de%3Bstroke-width%3A.40518%3Bstroke-linecap%3Asquare%22%20cx%3D%22449.283%22%20cy%3D%22357.57%22%20r%3D%22290%22%20d%3D%22M42.817%2020.709A16.796%2016.796%200%200%201%2026.021%2037.505A16.796%2016.796%200%200%201%209.225%2020.709A16.796%2016.796%200%200%201%2042.817%2020.709z%22%2F%3E%3Cpath%20d%3D%22M7.074%2028.124c2.085%206.238%207.06%2015.354%2018.91%2023.821%2011.85%20-8.473%2016.819%20-17.584%2018.904%20-23.821%200.944%20-2.317%201.471%20-4.842%201.494%20-7.489%200.006%20-0.122%20-0.012%20-0.197%20-0.012%20-0.214v-0.006C46.371%209.139%2037.243%200%2025.972%200c-11.276%200%20-20.41%209.139%20-20.41%2020.416%200%200%200%200.075%200.006%200.22%200.029%202.647%200.562%205.172%201.506%207.489m18.91%20-23.091c8.688%200%2015.73%207.043%2015.73%2015.73s-7.043%2015.73%20-15.73%2015.73c-8.688%200%20-15.73%20-7.043%20-15.73%20-15.73s7.043%20-15.73%2015.73%20-15.73%22%20style%3D%22fill%3A%23409d76%3Bfill-opacity%3A1%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E`;
}

export class SensorThingsLayer extends VectorTileLayer {
  static get className(): string {
    return 'SensorThingsLayer';
  }

  static getDefaultOptions(): Omit<SensorThingsOptions, 'url'> {
    return {
      ...super.getDefaultOptions(),
      renderer: 'primitive',
      minLevel: 1,
      maxLevel: 15,
      style: {
        type: 'VectorStyleItem',
        image: {
          src: getSensorIconDataUrl(),
        },
        fill: {
          color: [255, 255, 255, 1],
        },
        stroke: {
          color: [0, 0, 0, 1],
          width: 1,
        },
      },
    };
  }

  private _observedProperty?: string;

  private _additionalFilters?: string;

  private _moreInformationLink?: string;

  constructor(options: SensorThingsOptions) {
    const defaultOptions = SensorThingsLayer.getDefaultOptions();
    const mergedOptions = {
      ...options,
      renderer: options.renderer ?? defaultOptions.renderer,
      minLevel: options.minLevel || defaultOptions.minLevel,
      maxLevel: options.maxLevel || defaultOptions.maxLevel,
      style: options.style ?? defaultOptions.style,
    };
    super(mergedOptions);

    this._observedProperty = options.observedProperty;
    this._additionalFilters = options.additionalFilters;
    this._moreInformationLink = options.moreInformationLink;
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        const things = await queryThingsWithLocations(
          this.url,
          this._observedProperty,
          this.extent ?? undefined,
          this._additionalFilters,
        );
        if (things.length === 0) {
          this.getLogger().warning(
            `The request to the SensorThings API of layer "${this.name}" did not return any entities. Make sure the filters (extent, observerProperty) are set correctly.`,
          );
        }
        const thingFeatures = things
          .filter((thing) => !!thing.Locations[0])
          .map((thing) => {
            const feature = parseGeoJSON(thing.Locations[0].location)
              .features[0];
            feature.setId(String(thing['@iot.id']));
            feature.setProperties({
              name: thing.name,
              ...thing.properties,
            } as ThingFeatureProperties);
            return feature;
          });

        if (things.length !== thingFeatures.length) {
          this.getLogger().warning(
            `On layer "${this.name}" ${things.length - thingFeatures.length} things lack location data and were excluded.`,
          );
        }

        this.tileProvider = new StaticFeatureTileProvider({
          features: thingFeatures,
        });
        await super.initialize();
      } catch (error) {
        this.getLogger().error(
          `Initializing of layer "${this.name}" failed, due to a`,
          error,
          'Please ensure that the url is correct.',
        );
      }
    }
  }

  get observedProperty(): string | undefined {
    return this._observedProperty;
  }

  get additionalFilters(): string | undefined {
    return this._additionalFilters;
  }

  get moreInformationLink(): string | undefined {
    return this._moreInformationLink;
  }

  toJSON(): SensorThingsOptions {
    const { tileProvider, ...rest } = super.toJSON();
    const json: SensorThingsOptions = { ...rest, url: this.url };
    if (this._observedProperty) {
      json.observedProperty = this._observedProperty;
    }
    if (this._additionalFilters) {
      json.additionalFilters = this._additionalFilters;
    }
    if (this._moreInformationLink) {
      json.moreInformationLink = this._moreInformationLink;
    }
    return json;
  }
}
