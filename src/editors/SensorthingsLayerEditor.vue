<script setup lang="ts">
  import type { PropType } from 'vue';
  import { inject, onMounted, ref, toRaw } from 'vue';
  import { VCol, VRow } from 'vuetify/components';
  import { VectorProperties } from '@vcmap/core';
  import type { VcsUiApp } from '@vcmap/ui';
  import {
    AbstractConfigEditor,
    NotificationType,
    useComponentId,
    VcsLabel,
    VcsSelect,
    VcsTextField,
  } from '@vcmap/ui';
  import { getLogger } from '@vcsuite/logger';
  import {
    SensorThingsLayer,
    type SensorThingsOptions,
  } from '../sensorThingsLayer.js';
  import {
    ensureExtent,
    ensureKeys,
    ensureProperties,
  } from './app-configurator/editorComposables.js';
  import GeneralLayerSettings from './app-configurator/layer/settings/GeneralLayerSettings.vue';
  import ExtendedLayerSettings from './app-configurator/layer/settings/ExtendedLayerSettings.vue';
  import LevelSettings from './app-configurator/layer/settings/LevelSettings.vue';
  import MapHandlingLayerSettings from './app-configurator/layer/settings/MapHandlingLayerSettings.vue';
  import DisplayLayerSettings from './app-configurator/layer/settings/DisplayLayerSettings.vue';
  import ExtentSettings from './app-configurator/layer/settings/ExtentSettings.vue';
  import VcsObjectInformationSettings from './app-configurator/VcsObjectInformationSettings.vue';
  import FeatureInfoSettings from './app-configurator/layer/settings/FeatureInfoSettings.vue';
  import { isRequiredString } from './app-configurator/validation.js';
  import { name } from '../../package.json';
  import type { ObservedPropertyEntity } from '../sensorThingsAPI.js';
  import { queryObservedProperties } from '../sensorThingsAPI.js';

  const app = inject<VcsUiApp>('vcsApp')!;

  const props = defineProps({
    getConfig: {
      type: Function as PropType<() => SensorThingsOptions>,
      required: true,
    },
    setConfig: {
      type: Function as PropType<(config?: SensorThingsOptions) => void>,
      required: true,
    },
  });

  const config = props.getConfig();
  ensureKeys<SensorThingsOptions, 'properties' | 'extent'>(config, {
    properties: ensureProperties,
    extent: ensureExtent,
  });

  config.vectorProperties = new VectorProperties(
    config.vectorProperties || {},
  ).getValues();
  const defaultOptions = SensorThingsLayer.getDefaultOptions();
  const localConfig = ref<
    SensorThingsOptions & {
      properties: {
        featureInfo?: string;
      };
    }
  >({
    ...defaultOptions,
    ...config,
  });

  const observedPropertyItems = ref<
    { value: string; title: string }[] | undefined
  >();

  function cleanUpObservedProperties(): void {
    localConfig.value.observedProperty = '';
    observedPropertyItems.value = undefined;
  }

  function setupObservedPropertyItems(
    observedProperties: ObservedPropertyEntity[],
  ): void {
    const currentProperty = localConfig.value.observedProperty;
    if (observedProperties.every((p) => p.name !== currentProperty)) {
      localConfig.value.observedProperty = '';
    }

    observedPropertyItems.value = [
      { value: '', title: 'sensorthings.editors.layer.noFilter' },
    ].concat(
      observedProperties.map((prop) => ({
        value: prop.name,
        title: prop.name,
      })),
    );
  }

  function isValidOptionalUrl(value: string): string | true {
    if (!value || value === '') return true;
    try {
      const parsed = new URL(value);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return true;
      }
    } catch (e) {
      getLogger(name).debug('Invalid URL provided', e as string);
    }
    return 'sensorthings.editors.validation.validUrl';
  }

  let cachedUrl: string | undefined;
  async function sendTestQuery(): Promise<void> {
    if (localConfig.value.url && localConfig.value.url !== cachedUrl) {
      cachedUrl = localConfig.value.url;
      try {
        const properties = await queryObservedProperties(localConfig.value.url);
        setupObservedPropertyItems(properties);

        app.notifier.add({
          message: 'sensorthings.editors.layer.fetchSuccess',
          type: NotificationType.SUCCESS,
        });
      } catch (e) {
        cleanUpObservedProperties();
        app.notifier.add({
          message: 'sensorthings.editors.layer.fetchFailed',
          type: NotificationType.ERROR,
        });
        getLogger(name).error(e as string);
      }
    }
  }

  const submit = (): void => {
    if (localConfig.value.observedProperty === '') {
      delete localConfig.value.observedProperty;
    }
    const c = structuredClone(toRaw(localConfig.value)) as SensorThingsOptions;
    props.setConfig(c);
  };

  const cancel = (): void => {
    props.setConfig();
  };

  onMounted(async () => {
    await sendTestQuery();
  });

  const cid = useComponentId();
</script>

<template>
  <AbstractConfigEditor @submit="submit" @cancel="cancel">
    <GeneralLayerSettings v-model="localConfig" hide-url>
      <template #append>
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-url`" required>
              {{ $t('appConfigurator.editors.layer.general.url') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              :id="`${cid}-url`"
              clearable
              v-model.trim="localConfig.url"
              :rules="[isRequiredString]"
              @blur="sendTestQuery"
            />
          </v-col>
        </v-row>
      </template>
    </GeneralLayerSettings>
    <ExtendedLayerSettings v-model="localConfig">
      <template #append>
        <LevelSettings v-model="localConfig" />
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-observedProperty`">
              {{ $t('sensorthings.editors.layer.observedPropertyFilter') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsSelect
              :id="`${cid}-observedProperty`"
              v-model="localConfig.observedProperty"
              :items="observedPropertyItems"
              no-data-text="sensorthings.editors.layer.noData"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-additionalFilters`">
              {{ $t('sensorthings.editors.layer.additionalFilters') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              :id="`${cid}-additionalFilters`"
              clearable
              v-model.trim="localConfig.additionalFilters"
            >
              <template #prepend-inner>$filter=</template>
            </VcsTextField>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel :html-for="`${cid}-moreInformationLink`">
              {{ $t('sensorthings.editors.layer.moreInformationLink') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              :id="`${cid}-moreInformationLink`"
              clearable
              v-model.trim="localConfig.moreInformationLink"
              :rules="[isValidOptionalUrl]"
            />
          </v-col>
        </v-row>
      </template>
    </ExtendedLayerSettings>
    <MapHandlingLayerSettings v-model="localConfig">
      <template #append>
        <FeatureInfoSettings v-model="localConfig.properties.featureInfo" />
      </template>
    </MapHandlingLayerSettings>
    <DisplayLayerSettings v-model="localConfig" />
    <ExtentSettings v-model="localConfig" />
    <VcsObjectInformationSettings v-model="localConfig" />
  </AbstractConfigEditor>
</template>
