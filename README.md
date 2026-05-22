# NavGate

Aplicativo Expo/React Native para consulta de aerodromos brasileiros, mapa aeronautico, favoritos, METAR/TAF e planejamento simples de rota.

## Stack atual

- Expo SDK 54 com Expo Router
- React Native 0.81
- MapLibre React Native 10
- Zustand para estado de rota
- SQLite/AsyncStorage para dados locais
- React Native Reanimated 3 + Gesture Handler para lista arrastavel

## Arquitetura nativa

O projeto esta propositalmente em Legacy Architecture:

- `app.json`: `newArchEnabled: false`
- `android/gradle.properties`: `newArchEnabled=false`

Nao atualizar `react-native-reanimated` para a linha 4 sem planejar a migracao para New Architecture. A versao 4 exige New Architecture e quebra a build atual com MapLibre 10.

## Comandos uteis

```bash
npm install
npx expo start --clear
npx tsc --noEmit
```

Para testar novas dependencias nativas em Android e necessario gerar/instalar um novo development build:

```bash
npx expo run:android
```

ou via EAS development build.

## Arquivo do projeto

Documentacoes antigas, checklists e codigo obsoleto foram movidos para `arquivo-projeto/`. Eles ficam preservados para consulta, mas nao fazem parte do fluxo atual do app.
