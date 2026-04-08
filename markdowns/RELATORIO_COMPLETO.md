# NavGate - Relatorio Tecnico Completo

> Versao: 0.6 | Data: 06/Abril/2026
> Ultima atualizacao: Migracao METAR para NOAA + Mapa interativo com marcadores

---

## Sumario

1. [O que e o NavGate](#1-o-que-e-o-navgate)
2. [Conceitos de Aviacao](#2-conceitos-de-aviacao)
3. [Stack Tecnologica](#3-stack-tecnologica)
4. [Arquitetura do Projeto](#4-arquitetura-do-projeto)
5. [Estrutura de Pastas Completa](#5-estrutura-de-pastas-completa)
6. [Configuracoes](#6-configuracoes)
7. [Sistema de Navegacao](#7-sistema-de-navegacao)
8. [Feature: Busca de Aerodromos](#8-feature-busca-de-aerodromos)
9. [Feature: Detalhes do Aerodromo](#9-feature-detalhes-do-aerodromo)
10. [Feature: Favoritos](#10-feature-favoritos)
11. [Feature: Meteorologia (METAR/TAF)](#11-feature-meteorologia-metartaf)
12. [Feature: Mapa Interativo](#12-feature-mapa-interativo)
13. [Servicos Compartilhados](#13-servicos-compartilhados)
14. [Tema Visual](#14-tema-visual)
15. [APIs Externas](#15-apis-externas)
16. [Estado Atual e Proximos Passos](#16-estado-atual-e-proximos-passos)

---

## 1. O que e o NavGate

NavGate e um aplicativo mobile de planejamento de voo VFR (Visual Flight Rules) voltado para pilotos brasileiros de aviacao geral. O app permite:

- Buscar qualquer aerodromo do Brasil por codigo ICAO, nome ou cidade
- Consultar condicoes meteorologicas em tempo real (METAR e TAF)
- Visualizar aerodromos em um mapa interativo
- Salvar aerodromos favoritos para acesso rapido
- Classificar automaticamente condicoes de voo (VFR, MVFR, IFR, LIFR)

O publico-alvo sao pilotos que precisam consultar rapidamente as condicoes de um aerodromo antes de voar.

---

## 2. Conceitos de Aviacao

O app lida com terminologia especifica de aviacao. Aqui esta o que cada conceito significa e onde aparece no codigo:

### ICAO (Codigo do Aerodromo)

- Codigo de 4 letras que identifica unicamente cada aerodromo no mundo
- No Brasil, comecam com `SB` (ex: `SBGR` = Guarulhos, `SBSP` = Congonhas)
- No codigo: campo `icao` no tipo `Aerodromo` (`src/features/aerodromos/types.ts`)

### IATA (Codigo Comercial)

- Codigo de 3 letras usado por companhias aereas (ex: `GRU`, `CGH`)
- Nem todo aerodromo tem IATA — so os que recebem voos comerciais
- No codigo: campo `iata` no tipo `Aerodromo` (pode ser string vazia)

### METAR (Meteorological Aerodrome Report)

- Foto do tempo AGORA em um aerodromo especifico
- Formato padrao internacional da ICAO, atualizado a cada 30 minutos
- Exemplo: `SBGR 070000Z 13005KT 9999 SCT013 BKN036 23/20 Q1020`

**Decodificando o METAR acima:**

| Trecho | Significado |
|---|---|
| `SBGR` | Aerodromo (Guarulhos) |
| `070000Z` | Dia 07, horario 00:00 UTC |
| `13005KT` | Vento de 130 graus (SE), 5 nos |
| `9999` | Visibilidade maior que 10 km |
| `SCT013` | Nuvens esparsas a 1.300 pes |
| `BKN036` | Nublado a 3.600 pes |
| `23/20` | Temperatura 23C, ponto de orvalho 20C |
| `Q1020` | Pressao atmosferica 1020 hPa |

No codigo: o parsing e feito em `metarParser.ts` (linhas 44-153)

### TAF (Terminal Aerodrome Forecast)

- Previsao do tempo para as proximas 24-30 horas em um aerodromo
- Formato similar ao METAR mas com periodos de validade
- Inclui termos como `BECMG` (becoming/mudando para), `TEMPO` (temporariamente), `PROB30` (30% de probabilidade)
- No codigo: retornado como string bruta pela funcao `buscarTaf()` em `metarService.ts`

### Condicoes de Voo

Classificacao automatica baseada em visibilidade e teto de nuvens:

| Condicao | Visibilidade | Teto | Cor no app | Significado |
|---|---|---|---|---|
| VFR | >= 8 km | >= 3.000 ft | Verde `#22C55E` | Voo visual permitido |
| MVFR | >= 5 km | >= 1.000 ft | Azul `#3B82F6` | Voo visual marginal |
| IFR | >= 1.6 km | >= 500 ft | Vermelho `#EF4444` | Apenas voo por instrumentos |
| LIFR | < 1.6 km | < 500 ft | Roxo `#A855F7` | Condicoes muito ruins |

No codigo: funcao `classificarCondicao()` em `metarParser.ts` (linhas 5-23)

### QNH (Pressao Atmosferica)

- Pressao atmosferica ajustada ao nivel do mar, em hectopascais (hPa)
- Usada pelo piloto para calibrar o altimetro
- Valor tipico: 1013 hPa (pressao padrao)
- No codigo: campo `qnh` no tipo `MetarProcessado`

### Tipos de Aerodromo

| Tipo no JSON | Label no app | Emoji |
|---|---|---|
| `large_airport` | Aeroporto Internacional | :airplane: |
| `medium_airport` | Aeroporto Regional | :flight_departure: |
| `small_airport` | Aerodromo | :small_airplane: |
| `heliport` | Heliporto | :helicopter: |
| `seaplane_base` | Base de Hidroavioes | :motor_boat: |

No codigo: constantes `TIPO_LABEL` e `TIPO_EMOJI` (definidas em multiplos arquivos — candidatas a centralizacao)

### Espacos Aereos

- Regioes no ceu com regras especificas de voo
- Alguns sao proibidos, outros exigem autorizacao previa
- No app: renderizados como poligonos coloridos no mapa (quando disponivel via OpenAIP)
- No codigo: `mapaService.buscarEspacosAereos()` + camadas `FillLayer`/`LineLayer` em `MapaBase.tsx`

---

## 3. Stack Tecnologica

Cada tecnologia e POR QUE foi escolhida:

| Tecnologia | Versao | Proposito |
|---|---|---|
| **Expo SDK** | 54.0.33 | Framework que simplifica o desenvolvimento React Native. Gerencia build, dependencias nativas, e o ciclo de vida do app. |
| **React Native** | 0.81.5 | Permite escrever apps nativos para Android/iOS usando JavaScript/TypeScript. O app roda nativamente, nao em WebView. |
| **TypeScript** | 5.9.2 | Adiciona tipos ao JavaScript. Evita bugs como passar `string` onde deveria ser `number`. `strict: true` habilitado. |
| **Expo Router** | 6.0.23 | Sistema de navegacao baseado em arquivos. Cada arquivo em `src/app/` vira automaticamente uma rota/tela. |
| **MapLibre GL** | 10.4.2 | Biblioteca de mapas open source. Alternativa gratuita ao Google Maps. Renderiza tiles e camadas GeoJSON. |
| **Zustand** | 5.0.12 | Gerenciamento de estado global. Mais simples que Redux. Usado para favoritos. |
| **Expo SQLite** | 16.0.10 | Banco de dados local no celular. Armazena favoritos de forma persistente (sobrevive ao fechar o app). |
| **Expo Location** | 19.0.8 | Acesso ao GPS do celular. Preparado mas ainda nao utilizado na interface. |
| **Ionicons** | via @expo/vector-icons | Biblioteca de icones usada em toda a UI. |

### Por que Development Build (nao Expo Go)

O MapLibre requer codigo nativo compilado, que o Expo Go nao suporta. Por isso o projeto usa `expo-dev-client` — ele gera um APK/IPA customizado que inclui todas as dependencias nativas.

Para gerar o build:
```bash
eas build -p android --profile development
```

Para rodar:
```bash
npx expo start
```
E escanear o QR com o **Expo Dev Client** (nao o Expo Go).

---

## 4. Arquitetura do Projeto

### Padrao: Feature-Based com Services Layer

O projeto usa uma arquitetura em camadas organizadas por funcionalidade (feature). Cada feature e autocontida:

```
Feature/
  components/   -> UI especifica daquela feature
  hooks/        -> Logica de estado e efeitos
  services/     -> Acesso a dados (APIs, banco, arquivos)
  types.ts      -> Tipos TypeScript
```

### As Tres Camadas

```
  TELA (src/app/)
    |
    |  A tela e "burra" — ela so exibe dados e chama funcoes.
    |  Ela importa hooks e componentes das features.
    |
    v
  HOOK (features/*/hooks/)
    |
    |  O hook gerencia o estado (loading, erro, dados).
    |  Ele chama o service e devolve os dados prontos.
    |
    v
  SERVICE (features/*/services/)
    |
    |  O service faz o trabalho sujo: chama API, le arquivo,
    |  acessa o banco. Ele NAO sabe nada sobre React.
    |
    v
  FONTE DE DADOS (API externa, JSON local, SQLite)
```

### Exemplo Concreto: Buscar METAR

```
1. Usuario abre tela /metar/SBGR
   -> metar/[icao].tsx chama useMetar()

2. Hook useMetar() chama buscarMetar('SBGR')
   -> metarService.ts faz fetch para NOAA

3. NOAA responde com { rawOb: "SBGR 070000Z..." }
   -> metarService extrai rawOb
   -> chama parsearMetar(rawOb, 'SBGR')

4. metarParser.ts decodifica a string METAR
   -> retorna MetarProcessado { vento: 130, velocidade: 5, ... }

5. Hook atualiza o estado
   -> Tela re-renderiza com os dados processados
```

### Por que essa separacao importa

Se a API mudar (como fizemos trocando REDEMET pelo NOAA), so o `metarService.ts` precisa ser alterado. O hook e a tela nao mudam. Isso e exatamente o que aconteceu na migracao — 1 arquivo mudou, o resto ficou intacto.

---

## 5. Estrutura de Pastas Completa

```
NavGate/
|
|-- assets/
|   |-- data/
|   |   |-- aerodromos_br.json      # 4.609 aerodromos brasileiros (dados locais)
|   |-- icon.png                     # Icone do app
|   |-- splash-icon.png             # Tela de carregamento
|   |-- adaptive-icon.png           # Icone Android adaptivo
|   |-- favicon.png                  # Icone web
|
|-- markdowns/
|   |-- CONTEXTO_IA.md              # Contexto para assistentes de IA
|   |-- GUIA_API_KEYS.md            # Guia de registro nas APIs
|   |-- RELATORIO_COMPLETO.md       # ESTE ARQUIVO
|
|-- src/
|   |
|   |-- app/                         # === CAMADA DE TELAS (Expo Router) ===
|   |   |-- _layout.tsx              # Layout raiz (Stack Navigator)
|   |   |
|   |   |-- (tabs)/                  # Grupo de abas (bottom tab bar)
|   |   |   |-- _layout.tsx          # Configuracao das abas
|   |   |   |-- index.tsx            # Aba "Busca" (tela inicial)
|   |   |   |-- mapa.tsx             # Aba "Mapa"
|   |   |   |-- meteorologia.tsx     # Aba "Tempo"
|   |   |   |-- favoritos.tsx        # Aba "Favoritos"
|   |   |
|   |   |-- aerodromo/
|   |   |   |-- [icao].tsx           # Tela de detalhes (rota dinamica)
|   |   |
|   |   |-- metar/
|   |       |-- [icao].tsx           # Tela METAR/TAF (rota dinamica)
|   |
|   |-- features/                    # === CAMADA DE FEATURES ===
|   |   |
|   |   |-- aerodromos/              # Feature: busca e dados de aerodromos
|   |   |   |-- hooks/
|   |   |   |   |-- useAerodromos.ts # Hook de busca com filtro
|   |   |   |-- services/
|   |   |   |   |-- aerodromoService.ts # Busca no JSON local
|   |   |   |-- types.ts             # Interface Aerodromo
|   |   |
|   |   |-- favoritos/               # Feature: sistema de favoritos
|   |   |   |-- hooks/
|   |   |   |   |-- useFavoritos.ts  # Hook + Zustand store
|   |   |   |-- services/
|   |   |   |   |-- favoritoService.ts # CRUD no SQLite
|   |   |   |-- types.ts             # Interface Favorito (extends Aerodromo)
|   |   |
|   |   |-- metar/                   # Feature: meteorologia
|   |   |   |-- components/
|   |   |   |   |-- MeteorologiaCard.tsx # Card resumido de METAR
|   |   |   |-- hooks/
|   |   |   |   |-- useMetar.ts      # Hook de busca METAR/TAF
|   |   |   |-- services/
|   |   |   |   |-- metarService.ts  # Fetch na API do NOAA
|   |   |   |   |-- metarParser.ts   # Decodificador de string METAR
|   |   |   |-- types.ts             # Interface MetarProcessado
|   |   |
|   |   |-- mapa/                    # Feature: mapa interativo
|   |       |-- components/
|   |       |   |-- MapaBase.tsx      # Componente MapLibre com camadas
|   |       |   |-- AerodromoPanel.tsx # Bottom sheet ao tocar no marcador
|   |       |-- hooks/
|   |       |   |-- useMapa.ts       # Hook que carrega dados do mapa
|   |       |-- services/
|   |           |-- mapaService.ts   # GeoJSON + busca espacos aereos
|   |
|   |-- services/                    # === SERVICOS COMPARTILHADOS ===
|       |-- api/
|           |-- apiClient.ts         # Cliente HTTP generico com chaves
|
|-- .env                              # Chaves de API (nao vai pro git)
|-- app.json                          # Configuracao do Expo
|-- package.json                      # Dependencias
|-- tsconfig.json                     # Configuracao TypeScript
|-- README.md                         # Documentacao principal
|-- ENTENDENDO.md                     # Checklist rapido
|-- PROGRESSO_DETALHADO.md            # Historico tecnico
```

---

## 6. Configuracoes

### app.json

```json
{
  "expo": {
    "name": "NavGate",
    "scheme": "navgate",
    "userInterfaceStyle": "dark",       // Forca tema escuro
    "newArchEnabled": false,             // MapLibre nao suporta nova arquitetura
    "plugins": [
      "@maplibre/maplibre-react-native", // Registra codigo nativo do mapa
      "expo-sqlite",                     // Registra banco SQLite
      ["expo-location", { ... }],        // GPS com mensagem de permissao
      "expo-font"                        // Fontes customizadas
    ],
    "android": {
      "package": "com.navgate.app",
      "permissions": [
        "ACCESS_COARSE_LOCATION",        // GPS aproximado
        "ACCESS_FINE_LOCATION"           // GPS preciso
      ]
    }
  }
}
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,            // Verificacao de tipos rigorosa
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]         // Permite importar com @/features/...
    }
  }
}
```

O alias `@/` evita imports relativos confusos como `../../../features/...`. Em vez disso:

```typescript
// Sem alias (confuso):
import { Aerodromo } from '../../../features/aerodromos/types';

// Com alias (limpo):
import { Aerodromo } from '@/features/aerodromos/types';
```

### .env

```
EXPO_PUBLIC_REDEMET_KEY=          # Nao mais utilizado (migrado para NOAA)
EXPO_PUBLIC_AISWEB_KEY=sua_chave  # NOTAMs — ainda nao integrado
EXPO_PUBLIC_OPENAIP_KEY=sua_chave # Espacos aereos — precisa registrar
```

O NOAA (METAR/TAF) **nao precisa de chave** — por isso nao tem entrada no `.env`.

### package.json (dependencias principais)

| Dependencia | Proposito |
|---|---|
| `expo` | Framework base |
| `expo-router` | Navegacao por arquivos |
| `react-native` | Runtime mobile |
| `@maplibre/maplibre-react-native` | Mapa vetorial |
| `expo-sqlite` | Banco local (favoritos) |
| `expo-location` | GPS (preparado, nao ativo na UI) |
| `zustand` | Estado global (favoritos) |
| `@expo/vector-icons` | Ionicons |
| `react-native-svg` | Renderizacao SVG |
| `react-native-chart-kit` | Graficos (preparado, nao ativo) |
| `expo-dev-client` | Habilita Development Build |

---

## 7. Sistema de Navegacao

O app usa **Expo Router**, que transforma a estrutura de pastas em rotas automaticamente.

### Layouts

**`src/app/_layout.tsx`** (Layout Raiz)

```typescript
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="aerodromo/[icao]" options={{ title: 'Detalhes' }} />
  <Stack.Screen name="metar/[icao]" options={{ title: 'METAR / TAF' }} />
</Stack>
```

- `Stack` = navegacao em pilha (telas empilhadas, com botao voltar)
- `(tabs)` = grupo de abas (nao aparece na URL)
- `[icao]` = rota dinamica (o valor vem da URL, ex: `/aerodromo/SBGR`)

**`src/app/(tabs)/_layout.tsx`** (Layout das Abas)

```typescript
<Tabs>
  <Tabs.Screen name="index" />       // Aba Busca (tela inicial)
  <Tabs.Screen name="mapa" />        // Aba Mapa
  <Tabs.Screen name="meteorologia" />// Aba Tempo
  <Tabs.Screen name="favoritos" />   // Aba Favoritos
</Tabs>
```

### Mapa de Navegacao

```
[Abas] ─────────────────────────────────────────
  |
  |-- Busca (index) ─── toque em card ──> /aerodromo/[icao]
  |-- Mapa ──────────── toque no ponto ─> AerodromoPanel ──> /aerodromo/[icao]
  |-- Tempo ─────────── toque no card ──> /metar/[icao]
  |-- Favoritos ─────── toque em card ──> /aerodromo/[icao]

[Stack] ────────────────────────────────────────
  |
  |-- /aerodromo/[icao] ─── "Ver METAR/TAF" ──> /metar/[icao]
  |-- /metar/[icao]
```

### Rotas Dinamicas

`[icao]` entre colchetes significa que o valor e dinamico. Quando navegamos com:

```typescript
router.push(`/aerodromo/SBGR`);
```

O Expo Router renderiza `src/app/aerodromo/[icao].tsx` e disponibiliza `icao = "SBGR"` via:

```typescript
const { icao } = useLocalSearchParams<{ icao: string }>();
```

---

## 8. Feature: Busca de Aerodromos

**Proposito:** Permitir ao usuario encontrar qualquer aerodromo brasileiro.

### Dados

**Arquivo:** `assets/data/aerodromos_br.json`
**Quantidade:** 4.609 aerodromos
**Campos por aerodromo:**

```json
{
  "icao": "SBGR",
  "nome": "Guarulhos - Governador Andre Franco Montoro International Airport",
  "tipo": "large_airport",
  "latitude": -23.431944,
  "longitude": -46.469444,
  "altitude_ft": 2459,
  "municipio": "Guarulhos",
  "regiao": "BR-SP",
  "iata": "GRU"
}
```

### Tipo TypeScript

**Arquivo:** `src/features/aerodromos/types.ts`

```typescript
export interface Aerodromo {
  icao: string;
  nome: string;
  tipo: 'large_airport' | 'medium_airport' | 'small_airport' | 'heliport' | 'seaplane_base';
  latitude: number;
  longitude: number;
  altitude_ft: number;
  municipio: string;
  regiao: string;
  iata: string;
}
```

### Service

**Arquivo:** `src/features/aerodromos/services/aerodromoService.ts`

```typescript
const AERODROMOS: Aerodromo[] = aerodromosData as Aerodromo[];
```

O JSON e carregado uma unica vez em memoria quando o modulo e importado. As buscas sao instantaneas (nao faz rede).

**Funcoes:**

| Funcao | O que faz |
|---|---|
| `buscarAerodromos(termo)` | Filtra por ICAO, nome ou municipio. Minimo 2 caracteres. Retorna max 20 resultados. |
| `buscarPorIcao(icao)` | Busca exata por ICAO. Retorna 1 aerodromo ou `undefined`. |
| `totalAerodromos()` | Retorna 4.609. |

### Hook

**Arquivo:** `src/features/aerodromos/hooks/useAerodromos.ts`

```typescript
export function useAerodromos() {
  const [resultados, setResultados] = useState<Aerodromo[]>([]);
  const [termo, setTermo] = useState('');

  const buscar = useCallback((texto: string) => {
    setTermo(texto);
    setResultados(buscarAerodromos(texto));
  }, []);

  return { termo, resultados, buscar, limpar, temResultados };
}
```

O hook e simples: recebe texto, chama o service, guarda resultados. O `useCallback` evita que a funcao `buscar` seja recriada a cada render.

### Tela

**Arquivo:** `src/app/(tabs)/index.tsx`

A tela tem tres estados:

1. **Nenhum texto digitado:** icone de aviao + "Digite o codigo ICAO, nome ou cidade"
2. **Texto digitado, sem resultados:** icone de busca + "Nenhum aerodromo encontrado"
3. **Com resultados:** `FlatList` com cards de aerodromos

Cada card mostra: emoji do tipo + ICAO + IATA (se houver) + nome + municipio/estado + altitude. Toque navega para `/aerodromo/[icao]`.

---

## 9. Feature: Detalhes do Aerodromo

**Proposito:** Exibir todas as informacoes de um aerodromo e acoes disponiveis.

### Tela

**Arquivo:** `src/app/aerodromo/[icao].tsx`

A tela recebe o ICAO via URL, busca o aerodromo com `buscarPorIcao(icao)`, e exibe:

1. **Cabecalho:** emoji + ICAO + badge IATA + botao favorito (coracao)
2. **Tipo:** ex: "Aeroporto Internacional"
3. **Nome completo**
4. **Secao Localizacao:** municipio, coordenadas (formatadas em graus N/S L/O), altitude em pes e metros
5. **Botao "Ver METAR / TAF":** navega para `/metar/[icao]`
6. **Botao "Ver no Mapa":** preparado mas ainda sem funcionalidade

### Formatacao de Coordenadas

```typescript
const latStr = `${Math.abs(aerodromo.latitude).toFixed(4)} ${aerodromo.latitude >= 0 ? 'N' : 'S'}`;
const lonStr = `${Math.abs(aerodromo.longitude).toFixed(4)} ${aerodromo.longitude >= 0 ? 'L' : 'O'}`;
```

Converte coordenadas decimais para o formato de aviacao: `23.4319 S  46.4694 O`

### Botao Favorito

Usa `useFavoritos()` para verificar e alternar o estado de favorito. O coracao muda de contorno cinza para preenchido vermelho.

---

## 10. Feature: Favoritos

**Proposito:** Salvar aerodromos para acesso rapido, persistindo mesmo ao fechar o app.

### Fluxo de Dados

```
Tela  ->  useFavoritos (Zustand)  ->  favoritoService  ->  SQLite (navgate.db)
```

### Banco de Dados SQLite

**Arquivo:** `src/features/favoritos/services/favoritoService.ts`

Tabela `favoritos`:

| Coluna | Tipo | Descricao |
|---|---|---|
| icao | TEXT PRIMARY KEY | Codigo unico |
| nome | TEXT | Nome do aerodromo |
| tipo | TEXT | Tipo (large_airport, etc) |
| latitude | REAL | Coordenada |
| longitude | REAL | Coordenada |
| altitude_ft | INTEGER | Altitude em pes |
| municipio | TEXT | Cidade |
| regiao | TEXT | Estado (BR-XX) |
| iata | TEXT | Codigo IATA |
| data_adicao | TEXT | Timestamp ISO de quando foi favoritado |

**Funcoes do service:**

```typescript
favoritoService.initDb()                    // Cria tabela se nao existir
favoritoService.listarFavoritos()           // SELECT * ORDER BY data_adicao DESC
favoritoService.adicionarFavorito(aerodromo) // INSERT OR REPLACE
favoritoService.removerFavorito(icao)       // DELETE WHERE icao = ?
favoritoService.isFavorito(icao)            // COUNT(*) > 0
```

O `PRAGMA journal_mode = WAL` melhora performance de leitura/escrita simultanea.

### Zustand Store

**Arquivo:** `src/features/favoritos/hooks/useFavoritos.ts`

O Zustand e usado como camada de cache entre o SQLite e os componentes React:

```typescript
const useFavoritosStore = create<FavoritosState>((set, get) => ({
  favoritos: [],        // Lista em memoria
  isLoading: false,
  fetchFavoritos,       // Busca do SQLite -> atualiza memoria
  adicionarFavorito,    // Salva no SQLite -> rebusca tudo
  removerFavorito,      // Deleta no SQLite -> rebusca tudo
  isFavorito,           // Verifica na lista em memoria (sincrono)
}));
```

**Por que Zustand e nao so SQLite?**

- SQLite e assincrono (precisa de `await`). O React precisa de dados sincronos para renderizar.
- Zustand mantem os favoritos em memoria, permitindo acesso instantaneo.
- Quando voce adiciona/remove, o Zustand rebusca tudo do SQLite para manter sincronizado.

### Tipo

**Arquivo:** `src/features/favoritos/types.ts`

```typescript
export interface Favorito extends Aerodromo {
  data_adicao: string;
}
```

`Favorito` e um `Aerodromo` com um campo extra: a data em que foi salvo.

### Tela de Favoritos

**Arquivo:** `src/app/(tabs)/favoritos.tsx`

Exibe lista de favoritos salvos. Cada card navega para `/aerodromo/[icao]`. Estado vazio mostra icone de coracao com mensagem orientando o usuario.

### Tela de Meteorologia

**Arquivo:** `src/app/(tabs)/meteorologia.tsx`

Usa os MESMOS favoritos mas renderiza `MeteorologiaCard` para cada um — mostrando a condicao de voo atual (VFR/IFR) de cada aerodromo favoritado.

---

## 11. Feature: Meteorologia (METAR/TAF)

**Proposito:** Buscar e exibir condicoes meteorologicas reais de qualquer aerodromo.

### Fonte de Dados

**Antes:** API REDEMET (DECEA, governo brasileiro) — suspensa
**Agora:** NOAA Aviation Weather Center (governo americano) — gratuito, sem chave

```
METAR: https://aviationweather.gov/api/data/metar?ids=SBGR&format=json
TAF:   https://aviationweather.gov/api/data/taf?ids=SBGR&format=json
```

### Service

**Arquivo:** `src/features/metar/services/metarService.ts`

```typescript
export async function buscarMetar(icao: string) {
  const url = `${BASE_URL}/metar?ids=${icao}&format=json`;
  const response = await fetch(url);
  const data = await response.json() as NoaaMetarResponse[];
  const rawOb = data?.[0]?.rawOb;
  // rawOb = "SBGR 070000Z 13005KT 9999 SCT013 BKN036 23/20 Q1020"
  return {
    processado: parsearMetar(rawOb, icao),
    raw: rawOb,
    isMock: false,
  };
}
```

O NOAA retorna um array JSON. Cada elemento tem `rawOb` com a string METAR bruta. Essa string e passada ao parser.

### Parser (Decodificador)

**Arquivo:** `src/features/metar/services/metarParser.ts`

O parser e o coracao da feature. Ele recebe a string METAR bruta e extrai cada campo:

```typescript
export function parsearMetar(raw: string, icao: string): MetarProcessado {
  const partes = raw.trim().split(/\s+/);  // Divide por espacos

  for (const parte of partes) {
    // Cada regex detecta um tipo de informacao:

    // Hora: 070000Z -> "00:00 UTC"
    if (/^\d{6}Z$/.test(parte)) { ... }

    // Vento: 13005KT -> direcao 130, velocidade 5
    if (/^\d{3}\d{2,3}(G\d{2,3})?KT$/.test(parte)) { ... }

    // Vento variavel: VRB05KT -> direcao 0 (variavel), velocidade 5
    if (/^VRB\d{2,3}KT$/.test(parte)) { ... }

    // Visibilidade: 9999 -> "+10 km"
    if (/^\d{4}$/.test(parte)) { ... }

    // CAVOK: visibilidade e teto excelentes
    if (parte === 'CAVOK') { ... }

    // Nuvens: BKN036 -> "Nublado a 3.600 ft"
    const matchNuvem = parte.match(/^(FEW|SCT|BKN|OVC)(\d{3})/);

    // Temperatura: 23/20 -> temp 23, orvalho 20
    if (/^M?\d{2}\/M?\d{2}$/.test(parte)) { ... }

    // QNH: Q1020 -> 1020 hPa
    if (/^Q\d{4}$/.test(parte)) { ... }
  }

  // Classifica VFR/MVFR/IFR/LIFR
  const condicao = classificarCondicao(visibilidadeMetros, tetoPes);

  return { icao, raw, hora, vento_direcao, vento_velocidade, ... };
}
```

**Detalhes dos regex:**

| Regex | O que detecta | Exemplo |
|---|---|---|
| `/^\d{6}Z$/` | Hora UTC | `070000Z` |
| `/^\d{3}\d{2,3}(G\d{2,3})?KT$/` | Vento com/sem rajada | `13005KT`, `09010G18KT` |
| `/^VRB\d{2,3}KT$/` | Vento variavel | `VRB03KT` |
| `/^\d{4}$/` | Visibilidade em metros | `9999`, `0800` |
| `/^(FEW\|SCT\|BKN\|OVC)(\d{3})/` | Cobertura de nuvens | `BKN036` |
| `/^M?\d{2}\/M?\d{2}$/` | Temp/orvalho (M = negativo) | `23/20`, `M02/M05` |
| `/^Q\d{4}$/` | Pressao QNH | `Q1020` |

### Tipo do Resultado

**Arquivo:** `src/features/metar/types.ts`

```typescript
export interface MetarProcessado {
  icao: string;
  raw: string;                // Mensagem original
  hora: string;               // "00:00 UTC"
  vento_direcao: number;      // 130 (graus)
  vento_velocidade: number;   // 5 (nos)
  vento_rajada?: number;      // Opcional
  visibilidade: string;       // "+10 km"
  temperatura: number;        // 23
  ponto_orvalho: number;      // 20
  qnh: number;                // 1020
  condicao: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  cor_condicao: string;       // "#22C55E" (verde para VFR)
  nuvens: string;             // "Nublado a 3.600 ft"
}
```

### Hook

**Arquivo:** `src/features/metar/hooks/useMetar.ts`

```typescript
export function useMetar() {
  const [estado, setEstado] = useState<EstadoMetar>({
    loading: false,
    metar: null,
    taf: null,
    erro: null,
    isMock: false,
  });

  const buscar = useCallback(async (icao: string) => {
    // 1. Seta loading = true
    // 2. Promise.all busca METAR e TAF em paralelo
    // 3. Seta resultado ou erro
  }, []);

  return { ...estado, buscar };
}
```

O `Promise.all` busca METAR e TAF ao mesmo tempo, reduzindo o tempo de espera pela metade.

### Componente Card

**Arquivo:** `src/features/metar/components/MeteorologiaCard.tsx`

Card resumido usado na aba Meteorologia. Cada card instancia seu proprio `useMetar()` e busca o METAR individualmente. Mostra:
- ICAO + badge de condicao (VFR/IFR)
- Nome do aerodromo
- Vento e nuvens resumidos

### Tela Completa

**Arquivo:** `src/app/metar/[icao].tsx`

Tela dedicada com todos os detalhes:

1. **Badge de condicao:** grande, com borda colorida (verde VFR, vermelho IFR, etc)
2. **Secao "Condicoes Atuais":** vento (com direcao cardinal), visibilidade, nuvens, temperatura/orvalho, QNH
3. **Mensagem Original:** string METAR bruta em fonte monoespacada azul
4. **TAF - Previsao:** string TAF bruta completa

A funcao `grausParaDirecao()` converte graus em direcoes cardinais em portugues (N, NE, L, SE, S, SO, O, NO — note que usa "L" para Leste e "O" para Oeste, padrao brasileiro).

---

## 12. Feature: Mapa Interativo

**Proposito:** Visualizar todos os aerodromos do Brasil em um mapa, com possibilidade de tocar para ver detalhes.

### Componente Principal

**Arquivo:** `src/features/mapa/components/MapaBase.tsx`

```typescript
const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 512,  // 512px para nitidez em telas OLED
    },
  },
  layers: [{
    id: 'osm-layer',
    type: 'raster',
    source: 'osm',
    minzoom: 0,
    maxzoom: 19,
  }],
};
```

**Como o mapa funciona:**

1. O MapLibre renderiza "tiles" (pedacos de imagem) do OpenStreetMap
2. Cada tile e um quadrado de 512x512 pixels
3. Conforme o usuario da zoom, tiles mais detalhados sao carregados
4. `tileSize: 512` (em vez de 256) melhora a nitidez em telas de alta densidade

**Camadas renderizadas:**

```
[Camada base]    Tiles do OpenStreetMap (sempre visivel)
     |
[Espacos aereos] FillLayer (preenchimento translucido azul)
     |            LineLayer (borda azul)
     |            Fonte: OpenAIP (quando configurado)
     |
[Aerodromos]     CircleLayer (pontos cyan)
                  Fonte: aerodromos_br.json convertido em GeoJSON
```

**Escala progressiva dos pontos:**

```typescript
circleRadius: ['interpolate', ['linear'], ['zoom'],
  4, 2,    // Zoom 4 (pais inteiro): raio 2px
  10, 5,   // Zoom 10 (estado): raio 5px
  14, 9    // Zoom 14 (cidade): raio 9px
]
```

Isso e uma "expressao MapLibre" — o tamanho do ponto aumenta conforme o zoom.

**Interacao (toque nos pontos):**

```typescript
<MapLibreGL.ShapeSource
  id="aerodromos"
  shape={aerodromos}                    // GeoJSON com 4.609 pontos
  onPress={(e) => {
    const icao = e.features[0]?.properties?.icao;
    if (icao && onPressAerodromo) onPressAerodromo(icao);
  }}
>
```

O `onPress` do `ShapeSource` e disparado quando o usuario toca em qualquer ponto. O evento carrega as `properties` do GeoJSON (icao, nome, tipo).

### Painel de Detalhes (Bottom Sheet)

**Arquivo:** `src/features/mapa/components/AerodromoPanel.tsx`

Quando o usuario toca em um ponto do mapa, um painel sobe da parte inferior da tela com animacao spring:

```typescript
// Animacao de entrada
Animated.parallel([
  Animated.spring(slideAnim, {         // Painel desliza para cima
    toValue: 0,
    useNativeDriver: true,
    bounciness: 4,                      // Leve quique
  }),
  Animated.timing(fadeAnim, {          // Fundo escurece
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }),
]).start();
```

O painel mostra:
- Handle bar (barra decorativa indicando que pode arrastar)
- Emoji do tipo + ICAO + tipo por extenso
- Nome completo
- Municipio/estado + altitude em pes
- Botao "Ver detalhes" que navega para `/aerodromo/[icao]`

Fechar: toque no backdrop escuro ou no botao X.

### Service

**Arquivo:** `src/features/mapa/services/mapaService.ts`

```typescript
getAerodromosGeoJSON() {
  // Converte o array de aerodromos para formato GeoJSON
  // (padrao internacional para dados geograficos)
  const features = aerodromosData.map(a => ({
    type: 'Feature',
    properties: { icao: a.icao, nome: a.nome, tipo: a.tipo },
    geometry: {
      type: 'Point',
      coordinates: [a.longitude, a.latitude],
    },
  }));
  return { type: 'FeatureCollection', features };
}
```

**GeoJSON** e o formato padrao para dados geograficos. Cada "feature" tem:
- `properties`: dados descritivos (icao, nome)
- `geometry`: coordenadas no mapa (longitude, latitude)

O MapLibre entende GeoJSON nativamente, entao so precisamos converter e passar.

### Hook

**Arquivo:** `src/features/mapa/hooks/useMapa.ts`

```typescript
export function useMapa() {
  // Carrega aerodromos (instantaneo, local)
  const aeroGeoJSON = mapaService.getAerodromosGeoJSON();

  // Tenta buscar espacos aereos (rede, opcional)
  const airspaces = await mapaService.buscarEspacosAereos();

  return { aerodromos, espacosAereos, loading, error, recarregar };
}
```

Se a busca de espacos aereos falhar (como agora, sem API key), o mapa funciona normalmente — so sem os poligonos de espaco aereo.

### Tela

**Arquivo:** `src/app/(tabs)/mapa.tsx`

```typescript
export default function MapaScreen() {
  const { aerodromos, espacosAereos } = useMapa();
  const [selecionado, setSelecionado] = useState<Aerodromo | null>(null);

  const handlePressAerodromo = (icao: string) => {
    const aerodromo = buscarPorIcao(icao);   // Busca dados completos
    if (aerodromo) setSelecionado(aerodromo); // Abre o painel
  };

  return (
    <View>
      <MapaBase
        aerodromos={aerodromos}
        espacosAereos={espacosAereos}
        onPressAerodromo={handlePressAerodromo}
      />
      {selecionado && (
        <AerodromoPanel
          aerodromo={selecionado}
          onFechar={() => setSelecionado(null)}
        />
      )}
    </View>
  );
}
```

O estado `selecionado` controla se o painel esta aberto ou fechado. Quando `null`, o painel nao renderiza. Quando tem um `Aerodromo`, o painel aparece.

---

## 13. Servicos Compartilhados

### API Client

**Arquivo:** `src/services/api/apiClient.ts`

Cliente HTTP generico reutilizavel:

```typescript
export async function apiRequest<T>(
  base: keyof typeof API_BASES,  // 'AISWEB' | 'OPENAIP'
  endpoint: string,               // '/airspaces'
  params: Record<string, string>  // { country: 'BR' }
): Promise<T> {
  // 1. Monta URL com base + endpoint + query params
  // 2. Adiciona API key automaticamente conforme o servico
  // 3. Faz fetch com Accept: application/json
  // 4. Retorna dados tipados como T
}
```

**Servicos registrados atualmente:**

| Base | URL | Chave |
|---|---|---|
| AISWEB | `https://aisweb.decea.mil.br/api` | `EXPO_PUBLIC_AISWEB_KEY` |
| OPENAIP | `https://api.core.openaip.net/api` | `EXPO_PUBLIC_OPENAIP_KEY` |

**Nota:** O NOAA (METAR/TAF) NAO usa o apiClient porque nao precisa de chave. O `metarService.ts` faz `fetch` diretamente.

---

## 14. Tema Visual

O app usa um tema escuro (dark mode) otimizado para uso em cockpit, onde brilho reduzido e importante.

### Cores Principais

| Cor | Hex | Uso |
|---|---|---|
| Background | `#0a0f1e` | Fundo de todas as telas |
| Surface | `#1a2035` | Cards, secoes, inputs |
| Primary | `#4A9EFF` | ICAO, icones, botoes, tab ativa |
| Text Primary | `#ffffff` | Textos principais |
| Text Secondary | `#6B7280` | Labels, subtitulos, texto de apoio |
| Error | `#EF4444` | Erros, condicao IFR |
| Success | `#22C55E` | Condicao VFR |
| Warning | `#F59E0B` | Badges de aviso (dados simulados) |
| Accent Cyan | `#00e5ff` | Marcadores do mapa |
| Airspace Blue | `#00bfff` | Espacos aereos (preenchimento e borda) |

### Padrao de Estilo

Todos os componentes usam `StyleSheet.create()` com o mesmo padrao:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    padding: 16,
  },
  card: {
    backgroundColor: '#1a2035',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  // ...
});
```

**Nota:** As cores estao hardcoded em cada arquivo. Uma melhoria futura seria centralizar em `src/theme/colors.ts`.

---

## 15. APIs Externas

### NOAA Aviation Weather Center (ATIVO)

- **URL:** `https://aviationweather.gov/api/data`
- **Chave:** Nao precisa
- **Custo:** Gratuito
- **Cobertura:** Mundial (inclui Brasil)
- **Usado para:** METAR e TAF
- **Arquivo:** `src/features/metar/services/metarService.ts`

### OpenAIP (CONFIGURACAO PENDENTE)

- **URL:** `https://api.core.openaip.net/api`
- **Chave:** Precisa registrar em openaip.net
- **Custo:** Gratuito (tier basico)
- **Cobertura:** Mundial
- **Usado para:** Espacos aereos (poligonos no mapa)
- **Arquivo:** `src/features/mapa/services/mapaService.ts`
- **Status:** Erro 404 (chave nao configurada)

### OpenStreetMap (ATIVO)

- **URL:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Chave:** Nao precisa
- **Custo:** Gratuito
- **Usado para:** Tiles (imagens) do mapa base
- **Arquivo:** `src/features/mapa/components/MapaBase.tsx`

### REDEMET (REMOVIDO)

- **URL:** `https://api-redemet.decea.mil.br`
- **Status:** Suspenso, exige SAC do DECEA
- **Acao:** Removido do apiClient.ts e metarService.ts
- **Substituido por:** NOAA

### AISWEB (NAO INTEGRADO)

- **URL:** `https://aisweb.decea.mil.br/api`
- **Status:** Suspenso, mesma situacao do REDEMET
- **Usado para:** NOTAMs (futuro)
- **Alternativa:** NOAA tambem tem endpoint de NOTAMs

---

## 16. Estado Atual e Proximos Passos

### O que esta funcionando (v0.6)

| Feature | Status | Detalhes |
|---|---|---|
| Busca de aerodromos | COMPLETO | 4.609 aerodromos, busca local instantanea |
| Detalhes do aerodromo | COMPLETO | Todos os campos, coordenadas formatadas |
| Favoritos | COMPLETO | SQLite + Zustand, persiste ao fechar app |
| METAR em tempo real | COMPLETO | NOAA, gratuito, sem chave, dados reais |
| TAF (previsao) | COMPLETO | Mesmo endpoint NOAA |
| Classificacao VFR/IFR | COMPLETO | Automatica, com cores |
| Mapa com marcadores | COMPLETO | 4.609 pontos, escala por zoom |
| Toque no marcador | COMPLETO | Painel animado com detalhes |
| Navegacao entre telas | COMPLETO | Stack + Tabs com rotas dinamicas |

### O que falta

| Feature | Prioridade | Dependencia |
|---|---|---|
| Ativar botao "Ver no Mapa" na tela de detalhes | Alta | Nenhuma |
| Espacos aereos no mapa | Alta | Registrar no OpenAIP |
| NOTAMs | Media | NOAA ou AISWEB |
| Localizacao do usuario no mapa | Media | GPS (permissao ja configurada) |
| Planejamento de rota | Media | Mapa consolidado |
| Cache offline de METAR | Baixa | Nenhuma |
| Centralizar cores em theme | Baixa | Nenhuma |
| Extrair constantes duplicadas | Baixa | Nenhuma |

### Melhorias tecnicas identificadas

1. **`TIPO_EMOJI` e `TIPO_LABEL` duplicados** em 4 arquivos — centralizar em `src/constants/`
2. **`CardAerodromo` e `CardFavorito`** quase identicos — unificar em componente compartilhado
3. **Cores hardcoded** em 13+ arquivos — extrair para `src/theme/colors.ts`
4. **`any` no `useMapa.ts`** — tipar com interfaces GeoJSON
5. **`isMock` no useMetar** — pode ser removido (nao usamos mais mocks)

---

*Documento gerado em 06/Abril/2026. Reflete o estado do projeto apos a migracao METAR para NOAA e implementacao do mapa interativo.*
