import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestJson } from '@vcmap/core';
import {
  queryDatastreamWithObservations,
  queryDatastreamsOfThing,
  queryFirstObservation,
  queryLatestObservation,
} from '../src/sensorThingsAPI.js';
import type {
  DatastreamWithObservations,
  ObservationEntity,
} from '../src/sensorThingsAPI.js';

vi.mock('@vcmap/core', () => ({
  Projection: class {},
  requestJson: vi.fn(),
}));

const requestJsonMock = vi.mocked(requestJson);

function lastCalledUrl(): string {
  const call = requestJsonMock.mock.calls.at(-1);
  if (!call) {
    throw new Error('requestJson was not called');
  }
  return decodeURIComponent(call[0]).replace(/\s+/g, ' ');
}

const datastream: DatastreamWithObservations = {
  '@iot.id': 7,
  name: 'Temperature Sensor',
  description: 'Measures temperature',
  unitOfMeasurement: { name: 'Degrees Celsius', symbol: '°C' },
  observationType:
    'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement',
  ObservedProperty: { name: 'Temperature' },
  Observations: [],
};

const observation: ObservationEntity = {
  result: 21.5,
  phenomenonTime: '2026-01-01T12:00:00Z',
  resultTime: '2026-01-01T12:00:00Z',
};

describe('queryDatastreamsOfThing', () => {
  it('should request all datastreams of a thing including their observed property', async () => {
    requestJsonMock.mockResolvedValue({ value: [datastream] });

    const result = await queryDatastreamsOfThing(
      'https://st.example.com/v1.1/',
      '42',
    );

    expect(result).to.deep.equal([datastream]);
    const url = lastCalledUrl();
    expect(url).to.include(
      'https://st.example.com/v1.1/Things(42)/Datastreams',
    );
    expect(url).to.include(
      '$select=@iot.id,name,description,unitOfMeasurement,observationType',
    );
    expect(url).to.include('$expand=ObservedProperty($select=name)');
  });

  it('should follow pagination links', async () => {
    requestJsonMock
      .mockResolvedValueOnce({
        value: [datastream],
        '@iot.nextLink':
          'https://st.example.com/v1.1/Things(42)/Datastreams?$skiptoken=1',
      })
      .mockResolvedValueOnce({ value: [] });

    const result = await queryDatastreamsOfThing(
      'https://st.example.com/v1.1',
      '42',
    );

    expect(result).to.deep.equal([datastream]);
    expect(requestJsonMock).toHaveBeenCalledTimes(2);
    expect(lastCalledUrl()).to.include('$skiptoken=1');
  });
});

describe('queryDatastreamWithObservations', () => {
  it('should request the observations of a datastream within the time range', async () => {
    requestJsonMock.mockResolvedValue(datastream);

    const result = await queryDatastreamWithObservations(
      'https://st.example.com/v1.1',
      '42',
      7,
      new Date(2026, 0, 1, 12, 30),
      new Date(2026, 0, 2, 12, 30),
      500,
    );

    expect(result).to.equal(datastream);
    const url = lastCalledUrl();
    expect(url).to.include('Things(42)/Datastreams(7)');
    expect(url).to.include('$expand=Observations( $filter=phenomenonTime ge');
    expect(url).to.include('and phenomenonTime lt');
    expect(url).to.include('$top=500');
    expect(url).to.include('$orderby=phenomenonTime asc');
  });
});

describe('queryLatestObservation', () => {
  it('should request the datastream with its latest observation', async () => {
    requestJsonMock.mockResolvedValue({
      ...datastream,
      Observations: [observation],
    });

    const result = await queryLatestObservation(
      'https://st.example.com/v1.1',
      '42',
      7,
    );

    expect(result?.Observations).to.deep.equal([observation]);
    const url = lastCalledUrl();
    expect(url).to.include('Things(42)/Datastreams(7)');
    expect(url).to.include(
      '$expand=Observations($top=1;$orderby=phenomenonTime desc)',
    );
  });
});

describe('queryFirstObservation', () => {
  it('should request the oldest observation of a datastream', async () => {
    requestJsonMock.mockResolvedValue({ value: [observation] });

    const result = await queryFirstObservation(
      'https://st.example.com/v1.1',
      '42',
      7,
    );

    expect(result).to.equal(observation);
    const url = lastCalledUrl();
    expect(url).to.include('Things(42)/Datastreams(7)/Observations');
    expect(url).to.include('$top=1');
    expect(url).to.include('$orderby=phenomenonTime asc');
  });
});

beforeEach(() => {
  requestJsonMock.mockReset();
});
