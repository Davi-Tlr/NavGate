# NavGate — Documentação de Desenvolvimento
> Disciplina: Programação Para Dispositivos Móveis em Android  
> Universidade Estácio de Sá — Campus Maracanã · 2026.1  
> Discente: Davi Lucas Cassiano da Silva — 202408648103  
> Professor: Salustiano Oliveira

---

## Índice

1. [O que é o NavGate e por que existe](#1-o-que-é-o-navgate-e-por-que-existe)
2. [Tecnologias escolhidas e por quê](#2-tecnologias-escolhidas-e-por-quê)
3. [Estrutura de pastas — a arquitetura do projeto](#3-estrutura-de-pastas--a-arquitetura-do-projeto)
4. [Configurações do projeto](#4-configurações-do-projeto)
5. [Sistema de navegação — Expo Router](#5-sistema-de-navegação--expo-router)
6. [Feature: Busca de Aeródromos](#6-feature-busca-de-aeródromos)
7. [Fluxo de dados — como tudo se conecta](#7-fluxo-de-dados--como-tudo-se-conecta)
8. [APIs externas planejadas](#8-apis-externas-planejadas)
9. [Segurança e boas práticas adotadas](#9-segurança-e-boas-práticas-adotadas)

---

## 1. O que é o NavGate e por que existe

O NavGate é um aplicativo móvel de planejamento de navegação aérea VFR (Visual Flight Rules — Regras de Voo Visual) desenvolvido para pilotos e estudantes de aviação brasileiros.

### O problema real

A identificação do problema veio de uma conversa com um amigo e estudante de pilotagem vinculado a um aeroclube. Em conversas informais, ele relatou repetidamente a dificuldade de acessar ferramentas digitais adequadas para o planejamento de voos VFR no Brasil. Os aplicativos mais usados pela comunidade — como ForeFlight e Garmin Pilot — são pagos, com planos de assinatura em dólar, interface em inglês e dados aeronáuticos que nem sempre refletem as particularidades do espaço aéreo brasileiro, como os corredores visuais publicados pelo DECEA.

### A solução

O NavGate resolve isso sendo:
- **Gratuito** — usa exclusivamente fontes de dados públicas e abertas
- **Brasileiro** — dados do DECEA, REDEMET e AIP Brasil
- **Funcional offline parcialmente** — dados de aeródromos embutidos no app

### Funcionalidades previstas

| Feature | Status |
|---|---|
| Busca de aeródromos por ICAO, nome ou cidade | ✅ Implementado |
| Detalhes do aeródromo (pista, frequências, altitude) | 🔄 Próximo |
| METAR e TAF em tempo real via REDEMET | 🔄 Próximo |
| Mapa com aeródromos e espaços aéreos | 🔄 Próximo |
| Favoritos salvos localmente | 🔄 Próximo |

---

## 2. Tecnologias escolhidas e por quê

### React Native + Expo SDK 54

**O que é:** React Native é um framework que permite escrever aplicativos Android e iOS usando JavaScript/TypeScript. Em vez de aprender Java (Android nativo) ou Swift (iOS nativo), escreve-se uma vez e roda nos dois sistemas.

**Por que Expo:** O Expo é uma camada em cima do React Native que elimina configurações complexas. Com ele, é possível rodar o app no celular durante o desenvolvimento apenas escaneando um QR code pelo app Expo Go, sem precisar gerar um APK.

**Versão:** SDK 54, que inclui React Native 0.81 e React 19.1. Esta versão usa a New Architecture por padrão, que melhora significativamente a performance de renderização.

### TypeScript

**O que é:** TypeScript é JavaScript com tipagem. Permite definir que tipo de dado cada variável aceita.

**Por que usar:** Ao definir que um aeródromo tem os campos `icao: string`, `latitude: number`, etc., o editor (VS Code) avisa imediatamente se algum código tentar usar esses dados de forma errada — antes mesmo de rodar o app. Isso evita uma categoria inteira de erros em tempo de execução.

### Expo Router

**O que é:** Sistema de navegação baseado em arquivos. Cada arquivo dentro da pasta `app/` vira automaticamente uma tela do app.

**Por que não React Navigation puro:** O Expo Router já vem integrado ao Expo SDK 54 e usa convenção de arquivos igual ao Next.js, eliminando a necessidade de registrar rotas manualmente. É mais simples para projetos individuais.

### MapLibre React Native

**O que é:** Biblioteca de mapas open-source, fork do Mapbox v1 antes de se tornar proprietário.

**Por que não Google Maps:** Google Maps exige API key com potencial de cobrança. O MapLibre usa tiles do OpenStreetMap/OpenTopoMap, que são gratuitos e sem limite para uso pessoal/acadêmico. Além disso, suporta sobreposição de camadas GeoJSON, essencial para desenhar espaços aéreos sobre o mapa.

### Fontes de dados (APIs)

| API | Provedor | O que entrega | Custo |
|---|---|---|---|
| REDEMET | DECEA / Governo Federal | METAR, TAF, SIGMET, Radar | Gratuito com cadastro |
| AISWEB | DECEA / Governo Federal | NOTAMs, dados de aeródromos | Gratuito com cadastro |
| OpenAIP | Comunidade open-source | Espaços aéreos em GeoJSON | Gratuito, licença CC BY-NC 4.0 |
| OurAirports | Projeto open-source | Base de todos os aeródromos | Domínio público, download único |

---

## 3. Estrutura de pastas — a arquitetura do projeto

### Por que organizar assim

O projeto usa arquitetura **Feature-Based** (baseada em funcionalidades). Em vez de agrupar todos os componentes numa pasta, todos os serviços em outra, etc., cada funcionalidade do app tem sua própria pasta com tudo que precisa.

**Benefício prático:** Se a feature de "busca de aeródromos" precisar ser modificada, todos os arquivos relevantes estão em `src/features/aerodromos/`. Não é necessário navegar por 5 pastas diferentes para encontrar o que mudar.

### Estrutura completa

```
NavGate/
├── src/                          ← todo o código da aplicação
│   ├── app/                      ← telas (Expo Router lê esta pasta)
│   │   ├── _layout.tsx           ← layout raiz — ponto de entrada
│   │   └── (tabs)/               ← grupo de telas em abas
│   │       ├── _layout.tsx       ← define as 4 abas
│   │       ├── index.tsx         ← tela Busca
│   │       ├── mapa.tsx          ← tela Mapa
│   │       ├── meteorologia.tsx  ← tela METAR/TAF
│   │       └── favoritos.tsx     ← tela Favoritos
│   │
│   ├── features/                 ← funcionalidades do app
│   │   ├── aerodromos/           ← tudo sobre aeródromos
│   │   │   ├── components/       ← componentes visuais
│   │   │   ├── hooks/            ← lógica de estado
│   │   │   ├── services/         ← acesso a dados
│   │   │   └── types.ts          ← definição dos tipos
│   │   ├── metar/                ← tudo sobre METAR/TAF
│   │   ├── mapa/                 ← tudo sobre o mapa
│   │   └── favoritos/            ← tudo sobre favoritos
│   │
│   ├── shared/                   ← código reutilizado por múltiplas features
│   │   ├── components/           ← botões, inputs, etc.
│   │   ├── hooks/                ← hooks genéricos
│   │   └── utils/                ← funções utilitárias
│   │
│   ├── services/                 ← camada de acesso a dados externos
│   │   ├── api/                  ← chamadas HTTP (REDEMET, AISWEB)
│   │   └── storage/              ← banco de dados local (SQLite)
│   │
│   └── constants/                ← URLs, configurações globais
│
├── assets/
│   └── data/
│       └── aerodromos_br.json    ← 7573 aeródromos brasileiros (gerado)
│
├── .env                          ← chaves de API (não vai ao repositório)
├── .gitignore                    ← arquivos ignorados pelo Git
├── app.json                      ← configurações do Expo
├── package.json                  ← dependências do projeto
└── tsconfig.json                 ← configurações do TypeScript
```

### O princípio da responsabilidade única

Cada arquivo tem uma responsabilidade bem definida:

- **Telas (`app/`)** → apenas renderizam o que os hooks fornecem. Não contêm lógica de negócio.
- **Hooks (`hooks/`)** → gerenciam estado e orquestram chamadas de serviço.
- **Serviços (`services/`)** → única camada que acessa dados externos ou locais.
- **Tipos (`types.ts`)** → definem o formato dos dados.

---

## 4. Configurações do projeto

### `package.json` — dependências

```json
{
  "name": "navgate",
  "version": "1.0.0",
  "main": "expo-router/entry"
}
```

O campo `"main": "expo-router/entry"` é crítico. Ele diz ao Expo para usar o sistema de rotas por arquivos em vez do `App.tsx` padrão. Sem ele, o Expo Router nunca é ativado.

**Dependências instaladas e suas funções:**

| Pacote | Função |
|---|---|
| `expo` | Plataforma base com todas as ferramentas |
| `expo-router` | Navegação entre telas por arquivos |
| `react-native` | Framework mobile |
| `@maplibre/maplibre-react-native` | Mapas open-source |
| `expo-sqlite` | Banco de dados local para favoritos e cache |
| `@react-native-async-storage/async-storage` | Armazenamento de preferências simples |
| `expo-location` | GPS do celular |
| `react-native-svg` | Ícones e gráficos vetoriais |
| `react-native-chart-kit` | Gráfico de perfil de terreno |
| `zustand` | Gerenciamento de estado global |
| `react-native-safe-area-context` | Evita que conteúdo fique atrás da câmera/notch |
| `react-native-screens` | Performance de transições entre telas |

### `app.json` — configurações do Expo

Campos importantes:

```json
{
  "expo": {
    "scheme": "navgate",
    "newArchEnabled": true,
    "userInterfaceStyle": "dark"
  }
}
```

- **`scheme`**: Define o protocolo de deep link (`navgate://`). Obrigatório para o Expo Router funcionar.
- **`newArchEnabled`**: Ativa a New Architecture do React Native (Fabric + JSI), que melhora performance e é o padrão futuro.
- **`userInterfaceStyle: "dark"`**: Define tema escuro, adequado para uso em cockpit.

### `tsconfig.json` — TypeScript

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- **`strict: true`**: Ativa todas as verificações de tipo rigorosas do TypeScript.
- **`paths`**: Define o atalho `@/` para imports. Em vez de escrever `../../../../features/aerodromos/types`, escreve-se `@/features/aerodromos/types`. Mais legível e não quebra quando arquivos são movidos.

### `.gitignore` — o que não vai ao repositório

O `.gitignore` lista arquivos que o Git deve ignorar. Os mais importantes:

```
.env              ← chaves de API — NUNCA deve ir ao repositório
node_modules/     ← bibliotecas instaladas (pesadas, regeneradas pelo npm install)
.expo/            ← arquivos temporários do Expo
dist/             ← build gerado automaticamente
```

**Por que o `.env` não pode ir ao repositório:** Contém as chaves secretas das APIs (REDEMET, AISWEB, OpenAIP). Se enviado ao GitHub, qualquer pessoa poderia usar as chaves, potencialmente bloqueando o acesso.

---

## 5. Sistema de navegação — Expo Router

### Como o Expo Router funciona

O Expo Router usa o conceito de **roteamento por arquivo**: a estrutura de pastas dentro de `src/app/` define automaticamente as telas e a navegação entre elas.

```
src/app/
├── _layout.tsx        → layout raiz
└── (tabs)/
    ├── _layout.tsx    → layout das abas
    ├── index.tsx      → rota "/"  (tela inicial)
    ├── mapa.tsx       → rota "/mapa"
    ├── meteorologia.tsx → rota "/meteorologia"
    └── favoritos.tsx  → rota "/favoritos"
```

A pasta `(tabs)` com parênteses é uma **Route Group** — agrupa as telas sem adicionar o nome ao caminho da URL. O Expo Router interpreta isso como "essas telas devem aparecer juntas numa barra de abas".

### `src/app/_layout.tsx` — Layout Raiz

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
```

**O que cada parte faz:**

- `Stack` → Define que a navegação principal é um stack (pilha de telas). Quando o usuário navega para uma tela de detalhe, ela empilha sobre a anterior.
- `Stack.Screen name="(tabs)"` → Registra o grupo de abas como uma tela dentro do stack.
- `headerShown: false` → Remove o cabeçalho padrão do stack para o grupo de abas, pois cada aba terá seu próprio cabeçalho.
- `StatusBar style="light"` → Deixa os ícones da barra de status (hora, bateria, sinal) em branco, legíveis sobre o fundo escuro do app.

### `src/app/(tabs)/_layout.tsx` — Layout das Abas

```tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: '#4A9EFF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#0a0f1e',
          borderTopColor: '#1a2035',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Busca',
          headerTitle: 'NavGate',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      {/* ... demais abas */}
    </Tabs>
  );
}
```

**O que cada parte faz:**

- `initialRouteName="index"` → Garante que o app sempre abre na tela de Busca, independente de qual tela estava ativa antes.
- `tabBarActiveTintColor` → Cor azul `#4A9EFF` para a aba selecionada.
- `tabBarInactiveTintColor` → Cor cinza `#6B7280` para as abas não selecionadas.
- `tabBarStyle` → Estilo visual da barra inferior: fundo azul escuro, borda sutil.
- `Ionicons` → Biblioteca de ícones incluída pelo Expo. O `name="search"` carrega o ícone de lupa.
- `headerTitle: 'NavGate'` → Na tela de Busca, o cabeçalho mostra o nome do app em vez do nome da rota.

---

## 6. Feature: Busca de Aeródromos

Esta é a primeira feature completa do NavGate. Ela demonstra a arquitetura em camadas do projeto.

### De onde vêm os dados

O OurAirports (ourairports.com) disponibiliza uma base pública com todos os aeródromos do mundo em formato CSV. O arquivo `airports.csv` foi baixado e processado localmente pelo script `processar-aerodromos.js`, que filtrou apenas os aeródromos brasileiros e gerou o arquivo `assets/data/aerodromos_br.json` com **7.573 aeródromos**.

**Por que dados locais e não API em tempo real:**  
A lista de aeródromos muda raramente (novos aeródromos são cadastrados pouquíssimas vezes por ano). Baixar esse dado da internet toda vez que o usuário busca seria lento e desnecessário. Com o JSON embutido no app, a busca é instantânea e funciona sem internet.

### Script de processamento — `processar-aerodromos.js`

Este script Node.js é executado uma única vez durante o desenvolvimento:

1. Lê o arquivo `airports.csv`
2. Processa cada linha usando um parser que respeita campos entre aspas
3. Filtra apenas aeródromos com `iso_country = BR`
4. Filtra apenas tipos relevantes para VFR: aeroportos grandes, médios, pequenos, heliportos e bases de hidroaviões
5. Extrai apenas os campos necessários: ICAO, nome, tipo, coordenadas, altitude, município, região, IATA
6. Salva o resultado em `assets/data/aerodromos_br.json`

### `src/features/aerodromos/types.ts` — Definição dos dados

```typescript
export interface Aerodromo {
  icao: string;        // ex: "SBGR"
  nome: string;        // ex: "Guarulhos International Airport"
  tipo: 'large_airport' | 'medium_airport' | 'small_airport' | 'heliport' | 'seaplane_base';
  latitude: number;    // ex: -23.4356
  longitude: number;   // ex: -46.4731
  altitude_ft: number; // ex: 2459
  municipio: string;   // ex: "Guarulhos"
  regiao: string;      // ex: "BR-SP"
  iata: string;        // ex: "GRU"
}
```

**Por que definir tipos:** O TypeScript usa esta definição para verificar automaticamente todo o código que manipula aeródromos. Se tentar acessar `aerodromo.cidade` (campo inexistente), o editor avisa imediatamente com sublinhado vermelho.

### `src/features/aerodromos/services/aerodromoService.ts` — Acesso aos dados

```typescript
import aerodromosData from '../../../../assets/data/aerodromos_br.json';
import { Aerodromo } from '../types';

const AERODROMOS: Aerodromo[] = aerodromosData as Aerodromo[];

export function buscarAerodromos(termo: string): Aerodromo[] {
  if (!termo || termo.trim().length < 2) return [];
  const busca = termo.trim().toUpperCase();
  return AERODROMOS.filter(a =>
    a.icao.includes(busca) ||
    a.nome.toUpperCase().includes(busca) ||
    a.municipio.toUpperCase().includes(busca)
  ).slice(0, 20);
}
```

**Decisões de design:**
- `AERODROMOS` em maiúsculas indica constante — carregada uma vez na memória quando o app inicia.
- Mínimo de 2 caracteres para buscar — evita retornar todos os 7.573 aeródromos com uma busca vazia.
- `.slice(0, 20)` — limita a 20 resultados para não sobrecarregar a lista visual.
- Busca em ICAO, nome E município — usuário pode digitar `SBGR`, `Guarulhos` ou `Guarulhos Int` e encontrar o mesmo aeródromo.

### `src/features/aerodromos/hooks/useAerodromos.ts` — Lógica de estado

```typescript
import { useState, useCallback } from 'react';
import { buscarAerodromos } from '../services/aerodromoService';

export function useAerodromos() {
  const [resultados, setResultados] = useState<Aerodromo[]>([]);
  const [termo, setTermo] = useState('');

  const buscar = useCallback((texto: string) => {
    setTermo(texto);
    setResultados(buscarAerodromos(texto));
  }, []);

  const limpar = useCallback(() => {
    setTermo('');
    setResultados([]);
  }, []);

  return { termo, resultados, buscar, limpar, temResultados: resultados.length > 0 };
}
```

**O que é um hook:** Em React, hooks são funções que gerenciam estado e efeitos. O prefixo `use` é obrigatório por convenção.

**Por que `useCallback`:** Sem `useCallback`, as funções `buscar` e `limpar` seriam recriadas a cada re-renderização do componente. Com `useCallback`, elas são criadas uma vez e reutilizadas, melhorando a performance.

**Por que separar o hook da tela:** A tela não precisa saber como a busca funciona. Se amanhã a lógica de busca mudar (adicionar fuzzy search, por exemplo), só o hook e o serviço mudam — a tela permanece igual.

### `src/app/(tabs)/index.tsx` — Tela de Busca

A tela é composta por três partes:

**1. Campo de busca**
```tsx
<TextInput
  autoCapitalize="characters"
  onChangeText={buscar}
/>
```
`autoCapitalize="characters"` converte automaticamente para maiúsculas, pois códigos ICAO são sempre em maiúsculas (SBGR, SBBE, etc.).

**2. Lista de resultados (FlatList)**
```tsx
<FlatList
  data={resultados}
  keyExtractor={item => item.icao}
  renderItem={({ item }) => <CardAerodromo item={item} />}
  keyboardShouldPersistTaps="handled"
/>
```
`FlatList` é o componente de lista performático do React Native — renderiza apenas os itens visíveis na tela, não todos os 7.573 de uma vez. `keyboardShouldPersistTaps="handled"` permite tocar em um item da lista sem o teclado fechar primeiro.

**3. Estado vazio**
Quando não há resultados ou a busca tem menos de 2 caracteres, exibe um ícone de avião e instrução ao usuário.

---

## 7. Fluxo de dados — como tudo se conecta

```
Usuário digita "SBGR"
        ↓
TextInput.onChangeText dispara buscar("SBGR")
        ↓
Hook useAerodromos.buscar() atualiza o estado
        ↓
Chama aerodromoService.buscarAerodromos("SBGR")
        ↓
Serviço filtra os 7.573 aeródromos no JSON local
        ↓
Retorna array com aeródromos encontrados
        ↓
Hook atualiza resultados via setResultados()
        ↓
React re-renderiza a FlatList com os novos dados
        ↓
Usuário vê os cards na tela
```

Este fluxo unidirecional (dados fluem em uma só direção) é o padrão do React e facilita muito o rastreamento de bugs — se algo está errado na tela, você sabe exatamente em qual camada procurar.

---

## 8. APIs externas planejadas

### REDEMET — Meteorologia Aeronáutica

**Provedor:** DECEA / Comando da Aeronáutica (órgão federal)  
**Como acessar:** Cadastro gratuito em redemet.decea.mil.br → chave API gerada  
**Chave no projeto:** `EXPO_PUBLIC_REDEMET_KEY` no arquivo `.env`

Endpoints que serão utilizados:
```
GET https://api-redemet.decea.mil.br/mensagens/metar/{icao}?api_key=KEY
GET https://api-redemet.decea.mil.br/mensagens/taf/{icao}?api_key=KEY
```

O METAR (Meteorological Aerodrome Report) informa as condições meteorológicas atuais de um aeródromo. O TAF (Terminal Aerodrome Forecast) é a previsão para as próximas horas. Ambos são obrigatórios para o planejamento de qualquer voo, conforme o Manual do Piloto Privado da ANAC.

### OpenAIP — Espaços Aéreos

**Provedor:** Comunidade open-source  
**Licença:** CC BY-NC 4.0 (uso não comercial livre)  
**Como acessar:** Cadastro gratuito em openaip.net  
**Chave no projeto:** `EXPO_PUBLIC_OPENAIP_KEY`

Os espaços aéreos serão baixados uma vez como GeoJSON estático e armazenados em `assets/data/airspaces_br.json`. O MapLibre renderiza GeoJSON nativamente como camada sobre o mapa.

---

## 9. Segurança e boas práticas adotadas

### Proteção de chaves de API

As chaves de acesso às APIs ficam em `.env` na raiz do projeto:
```
EXPO_PUBLIC_REDEMET_KEY=chave_aqui
EXPO_PUBLIC_AISWEB_KEY=chave_aqui
EXPO_PUBLIC_OPENAIP_KEY=chave_aqui
```

O `.gitignore` garante que este arquivo **nunca seja enviado ao repositório Git**. Qualquer desenvolvedor que clonar o projeto precisará criar seu próprio `.env` com suas próprias chaves.

No código, as variáveis são acessadas via `process.env.EXPO_PUBLIC_REDEMET_KEY`. O prefixo `EXPO_PUBLIC_` é obrigatório para que o Expo exponha a variável ao código JavaScript do app.

### Padrão de imports com `@/`

```typescript
// ❌ Frágil — quebra se o arquivo for movido
import { Aerodromo } from '../../../../features/aerodromos/types';

// ✅ Robusto — sempre resolve a partir de src/
import { Aerodromo } from '@/features/aerodromos/types';
```

Configurado em `tsconfig.json` com `paths: { "@/*": ["src/*"] }`.

### Tratamento de dados externos

Todo dado que vem de uma API externa será tratado com `try/catch` e os estados `loading`, `data` e `error` serão sempre gerenciados:

```typescript
// Padrão que será aplicado em todas as chamadas de API
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  const resultado = await fetchMetar(icao);
  setData(resultado);
} catch (e) {
  setError('Não foi possível carregar o METAR.');
} finally {
  setLoading(false);
}
```

---

*Documento atualizado em 04/04/2026 — NavGate v0.2 (Feature: Busca de Aeródromos)*