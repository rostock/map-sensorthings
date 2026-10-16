# Info-Link-Button im FeatureInfo des SensorThings-Plugins

## Ziel

In der Layerkonfiguration eines `SensorThingsLayer` soll eine optionale Property (URL) angegeben werden können. Beim Info-Click auf ein Thing erscheint im Info-Fenster ein Button „Weitere Informationen“, der die konfigurierte URL (z. B. Fachanwendung) in einem neuen Tab öffnet.

## Getroffene Entscheidungen (mit User abgestimmt)

- Property liegt auf dem **Layer** (`SensorThingsLayer`), nicht auf den FeatureInfoViews.
- **Statische URL** pro Layer, keine Template-Platzhalter für Thing-Attribute.
- Button in **Chart- und Dashboard-Views**:
  - Chart-Views: Button **unter der Attributtabelle** in `ChartComponent.vue` (gilt automatisch für `ChartFeatureInfoView` und `ChartBalloonFeatureInfoView`).
  - Dashboard-Views (nur iFrame, keine Attributliste): Link als **Kopfaktion** (Fenster) bzw. Button in der Balloon-Titelleiste neben dem vorhandenen „in neuem Tab öffnen“-Button.
- **Fester i18n-Text**: „Weitere Informationen“ / „More information“, Icon `$vcsExternalLink`, Öffnen per `window.open(url, '_blank')`.

## Property-Name

`infoLinkUrl?: string` (optional, kein Default nötig)

## Änderungen

### 1. `src/sensorThingsLayer.ts`

- `SensorThingsOptions` um `infoLinkUrl?: string` erweitern.
- Privates Feld `_infoLinkUrl?: string`, Setzung im Konstruktor aus `options.infoLinkUrl`.
- Getter `get infoLinkUrl(): string | undefined`.
- `toJSON()`: Property nur schreiben, wenn gesetzt (Muster wie `observedProperty`).

### 2. `src/ChartComponent.vue` (Chart-Fenster + Chart-Balloon)

- In `setup()`: Layer ist bereits über `app.layers.getByKey(props.layerName) as SensorThingsLayer` erreichbar (mehrfach vorhanden). `infoLinkUrl` als `computed` aus dem Layer ableiten.
- Template: unterhalb der Attributtabelle (nach `</table>`, vor/neben dem `<v-divider />`) einen Container mit `VcsButton` rendern, nur wenn `infoLinkUrl` gesetzt ist:
  - Text: `$st('sensorthings.moreInfo')`, Icon `'$vcsExternalLink'`, Variant/Depressed passend zum vorhandenen Stil (`VcsButton` ist in `IframeBalloonComponent.vue` bereits im Einsatz → Import aus `@vcmap/ui`).
  - Click-Handler: `window.open(infoLinkUrl, '_blank')`.
- Keine Änderungen an `ChartFeatureInfoView`/`ChartBalloonFeatureInfoView`/`ChartBalloonComponent.vue` nötig (Layer-Zugriff erfolgt direkt im Component).

### 3. `src/dashboardFeatureInfoView.ts` (Dashboard-Fenster)

- In `getWindowComponentOptions()` (Parameter `layer` vorhanden):
  - `const infoLinkUrl = (layer as SensorThingsLayer).infoLinkUrl;`
  - Wenn gesetzt: neuen `VcsAction` `open-info-link` (analog zum vorhandenen `openInNewTabAction`) mit `title: 'sensorthings.moreInfo'`, `icon: '$vcsExternalLink'` und Callback `window.open(infoLinkUrl, '_blank')` in `windowOptions.state.headerActions` einhängen (gleiches Push-Muster wie `openInNewTabAction`).
- Import von `SensorThingsLayer` nur als `import type` (zyklische Importe vermeiden).

### 4. `src/dashboardBalloonFeatureInfoView.ts` + `src/IframeBalloonComponent.vue` (Dashboard-Balloon)

- `DashboardFeatureInfoViewProps` (in `dashboardBalloonFeatureInfoView.ts`) um `infoLinkUrl?: string` erweitern.
- In `getProperties()`: `infoLinkUrl` vom Layer lesen und in die Props aufnehmen.
- `IframeBalloonComponent.vue`:
  - Optionales Prop `infoLinkUrl?: string` deklarieren (dadurch leakt es nicht in die `$attrs` von `BalloonComponent`/`IframeComponent`).
  - Neben dem vorhandenen `VcsButton` (openInNewTab) einen zweiten `VcsButton` rendern, nur wenn `infoLinkUrl` gesetzt ist; Icon `mdi-information-outline` (falls im App-Icon-Set nicht verfügbar → fallback `$vcsExternalLink`), Tooltip `sensorthings.moreInfo`, Click → `window.open(infoLinkUrl, '_blank')`.

### 5. `src/editors/SensorthingsLayerEditor.vue` (App-Konfigurator)

- In `ExtendedLayerSettings > #append` eine neue Zeile (nach `additionalFilters`): `VcsTextField` mit `v-model.trim="localConfig.infoLinkUrl"`, clearable, Label `sensorthings.editors.layer.infoLinkUrl`.
- Optionale Validierungsregel: leer erlaubt; sonst `new URL(value)` in try/catch → bei Fehler i18n `sensorthings.editors.validation.validUrl` (Key existiert bereits).
- `localConfig`-Typ bzw. `SensorThingsOptions` deckt das neue Feld bereits ab (Punkt 1).

### 6. `src/index.ts` (i18n, en + de)

- `sensorthings.moreInfo`: `'More information'` / `'Weitere Informationen'`
- `sensorthings.editors.layer.infoLinkUrl`: `'Info link URL'` / `'Info-Link-URL'`

## Konfigurationsbeispiel (App-Config)

```json
{
  "type": "SensorThingsLayer",
  "name": "mySensorLayer",
  "url": "https://sensorthings.example.com/v1.1",
  "infoLinkUrl": "https://fachanwendung.example.com/sensoren",
  "properties": { "featureInfo": "ChartFeatureInfoView" }
}
```

## Risiken / Hinweise

- Layer ohne `infoLinkUrl`: Button/Action erscheint nicht – Rückwärtskompatibilität gegeben, bestehende Configs unverändert.
- Der Button in `ChartComponent.vue` wirkt automatisch auch in der Balloon-Variante; kein doppelter Pflegeaufwand.
- `layer` ist in `getWindowComponentOptions`/`getProperties` als Basisklasse `Layer` getypt → Cast auf `SensorThingsLayer` (nur für Layer dieses Typs; Views werden praktisch nur mit diesem Layertyp genutzt, Cast ist toleranter mit `?.` absichern).
- Falls ein Layer eine andere FeatureInfoView (z. B. `TableFeatureInfoView` aus `@vcmap/ui`) nutzt, greift die Funktion nicht (außerhalb des Plugin-Scope, mit User so abgestimmt).

## Validierung

- `npm run lint` (eslint + prettier)
- `npm run type-check` (vue-tsc)
- `npm test` (vitest; bestehende Specs müssen grün bleiben)
- Manuell per `npm start` (Dev-App, `config.json`): Layer mit `infoLinkUrl` konfigurieren und prüfen:
  1. Chart-Fenster: Button unter der Attributtabelle, öffnet URL in neuem Tab.
  2. Chart-Balloon: derselbe Button im Popup.
  3. Dashboard-Fenster: Kopfaktion neben „Dashboard in neuem Tab öffnen“.
  4. Dashboard-Balloon: zusätzlicher Button in der Titelleiste.
  5. Layer ohne `infoLinkUrl`: kein Button/keine Aktion.
  6. App-Konfigurator: Feld im Layer-Editor, Validierung bei ungültiger URL, Speichern → Wert landet in `toJSON()` der Layer-Config.
