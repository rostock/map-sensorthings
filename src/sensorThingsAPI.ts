import type { Extent } from '@vcmap/core';
import { Projection, requestJson } from '@vcmap/core';
import type { GeoJSONFeature } from 'ol/format/GeoJSON';

export type SensorThingsResponse<T> = {
  value: T[];
  '@iot.nextLink'?: string;
};

export type ThingEntity = {
  '@iot.selfLink': string;
  '@iot.id': number;
  name: string;
  description: string;
  properties?: object;
};

export type ThingWithLocations = ThingEntity & { Locations: LocationEntity[] };

export type LocationEntity = {
  '@iot.selfLink': string;
  '@iot.id': number;
  name: string;
  description: string;
  encodingType: string;
  properties?: object;
  location: GeoJSONFeature;
};

export type DatastreamEntity = {
  name: string;
  description: string;
  unitOfMeasurement: {
    name: string;
    symbol?: string;
    definition?: string;
  };
  observationType:
    | 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_CategoryObservation'
    | 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_CountObservation'
    | 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement'
    | 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Observation'
    | 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_TruthObservation';
};

export type DatastreamWithObservations = DatastreamEntity & {
  Observations: ObservationEntity[];
};

export type ObservationEntity = {
  result: number;
  phenomenonTime: string;
  resultTime: string;
};

export type ObservedPropertyEntity = {
  '@iot.selfLink': string;
  '@iot.id': number;
  name: string;
  definition: string;
  description: string;
  properties?: object;
};

async function fetchAllFromPagination<T>(url: string): Promise<T[]> {
  const entities: T[] = [];
  let requestUrl: string | undefined = encodeURI(url);

  while (requestUrl) {
    const response: SensorThingsResponse<T> =
      // eslint-disable-next-line no-await-in-loop
      await requestJson(requestUrl);
    entities.push(...response.value);

    requestUrl = response['@iot.nextLink'];
  }
  return entities;
}

/**
 * This function queries the SensorThings API for the Datastreams and a specific observed property of a Thing.
 * @param url The base URL of the SensorThings API
 * @param id The ID of the Thing
 * @param observedProperty The name of the observed property
 * @param startDate The start date of the observations
 * @param maxObservations The maximum number of queried observations. Will be applied as '$top'.
 * @returns The Datastreams with their Observations. The Observations are sorted by phenomenonTime in descending order and limited to {@link maxObservations}.
 */
export async function queryDatastreamsWithObservations(
  url: string,
  id: string,
  observedProperty: string,
  startDate: Date,
  endDate: Date,
  maxObservations: number,
): Promise<DatastreamWithObservations[]> {
  const baseUrl = url.endsWith('/') ? url : `${url}/`;
  const start = new Date(startDate);
  start.setHours(0, 0, 0);
  const end = new Date(endDate);
  end.setDate(endDate.getDate() + 1);
  end.setHours(0, 0, 0);

  const requestUrl = `${baseUrl}Things(${id})/Datastreams?
    $filter=ObservedProperty/name eq '${observedProperty}'&
    $top=1&
    $expand=Observations(
      $filter=phenomenonTime ge ${start.toISOString()} and phenomenonTime lt ${end.toISOString()};
      $top=${maxObservations};
      $orderby=phenomenonTime asc)`;
  return fetchAllFromPagination(requestUrl);
}

export async function queryDatastreamWithLatestObservation(
  url: string,
  id: string,
  observedProperty: string,
): Promise<DatastreamWithObservations> {
  const baseUrl = url.endsWith('/') ? url : `${url}/`;
  const requestUrl = `${baseUrl}Datastreams?
    $filter=ObservedProperty/name eq '${observedProperty}' and Thing/id eq ${id}&
    $orderby=Observations/phenomenonTime desc&
    $top=1&
    $expand=Observations($top=1;$orderby=phenomenonTime desc)`;
  const response = await requestJson<
    SensorThingsResponse<DatastreamWithObservations>
  >(encodeURI(requestUrl));
  return response.value[0];
}

export async function queryFirstObservation(
  url: string,
  id: string,
  observedProperty: string,
): Promise<ObservationEntity> {
  const baseUrl = url.endsWith('/') ? url : `${url}/`;
  const requestUrl = `${baseUrl}Datastreams?
    $filter=ObservedProperty/name eq '${observedProperty}' and Thing/id eq ${id}&
    $orderby=Observations/phenomenonTime asc&
    $top=1&
    $expand=Observations($top=1;$orderby=phenomenonTime asc)`;
  const response = await requestJson<
    SensorThingsResponse<DatastreamWithObservations>
  >(encodeURI(requestUrl));
  return response.value[0].Observations[0];
}

export async function queryObservedProperties(
  url: string,
): Promise<ObservedPropertyEntity[]> {
  const baseUrl = url.endsWith('/') ? url : `${url}/`;
  return fetchAllFromPagination(`${baseUrl}ObservedProperties`);
}

function createFilter(
  observedProperty?: string,
  extent?: Extent,
  additionalFilters?: string,
): string[] {
  const filter: string[] = [];
  if (observedProperty) {
    filter.push(`Datastreams/ObservedProperty/name eq '${observedProperty}'`);
  }
  if (extent) {
    const wgs84Extent = extent.getCoordinatesInProjection(
      new Projection({ epsg: 4326 }),
    );
    const [xmin, ymin, xmax, ymax] = wgs84Extent;
    filter.push(
      `st_within(Locations/location, geography'POLYGON ((${xmin} ${ymin}, ${xmax} ${ymin}, ${xmax} ${ymax}, ${xmin} ${ymax}, ${xmin} ${ymin}))')`,
    );
  }
  if (additionalFilters) {
    filter.push(additionalFilters);
  }
  return filter;
}

export async function queryThingsWithLocations(
  url: string,
  observedProperty?: string,
  extent?: Extent,
  additionalFilters?: string,
): Promise<ThingWithLocations[]> {
  const filter = createFilter(observedProperty, extent, additionalFilters);
  const queryOptions: string[] = [];
  if (filter.length) {
    queryOptions.push(`$filter=${filter.join(' and ')}`);
  }
  queryOptions.push('$expand=Locations($top=1)');
  const baseUrl = url.endsWith('/') ? url : `${url}/`;
  const combinedUrl = `${baseUrl}Things?$top=1000&${queryOptions.join('&')}`;
  return fetchAllFromPagination(combinedUrl);
}
