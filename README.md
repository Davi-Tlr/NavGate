# NavGate

**Aplicativo gratuito de planejamento de voo VFR para pilotos brasileiros.**

Desenvolvido como projeto de extensão universitária na Universidade Estácio de Sá (campus Maracanã)

---

## Por que o NavGate existe?

Pilotos VFR brasileiros não têm muitas opções gratuitas para planejar voos. Os apps mais usados no mundo, ForeFlight e Garmin Pilot, são pagos em dólar, em inglês, e nem sempre refletem as particularidades do espaço aéreo brasileiro.

O NavGate foi criado para resolver isso: um app em português, gratuito, com cartas oficiais do DECEA e dados meteorológicos em tempo real.

---

## O que o app faz

### Para o piloto

**Antes do voo:**
- Busca qualquer um dos 4.609 aeródromos brasileiros por código ICAO, nome ou cidade
- Mostra se o aeródromo opera VFR, IFR ou ambos
- Exibe o METAR e TAF em tempo real, condições meteorológicas atuais e previsão
- Classifica automaticamente as condições: VFR (bom para voar), MVFR (marginal), IFR (instrumentos necessários) ou LIFR (muito ruim)
- Abre as cartas oficiais do aeródromo direto no AISWEB do DECEA

**No planejamento da rota:**
- Traça a rota no mapa tocando nos aeródromos em sequência
- Calcula distância em milhas náuticas (NM) e rumo verdadeiro por trecho
- Reordena os pontos arrastando a lista
- Digita a velocidade de cruzeiro e o app calcula o tempo estimado de cada trecho, combustível necessário e horário de chegada (ETA)
- Mostra o perfil de terreno ao longo da rota com a altitude mínima segura de cruzeiro
- **A rota é salva automaticamente**, fechar o app e reabrir mantém o planejamento intacto

**No mapa:**
- Sobrepõe as cartas aeronáuticas WAC e REA oficiais do DECEA diretamente no mapa
- Mostra os espaços aéreos controlados
- Alterna entre mapa de rua e satélite
- Localiza sua posição via GPS em tempo real

**Favoritos:**
- Salva aeródromos favoritos
- Dashboard com status meteorológico de todos os favoritos em tempo real

---

### Stack

| | Versão |
|---|---|
| React Native | 0.81.5 |
| Expo SDK | ~54.0.33 |
| Expo Router | ~6.0.23 |
| MapLibre React Native | ^10.4.2 |
| Zustand | ^5.0.12 |
| AsyncStorage | 2.2.0 |
| expo-sqlite | ~16.0.10 |
| expo-location | ~19.0.8 |
| react-native-reanimated | ^3.19.4 |
| react-native-gesture-handler | ~2.28.0 |
| react-native-draggable-flatlist | ^4.0.3 |
| victory-native | ^36.9.2 |

### APIs

| API | O que faz | Precisa de chave? |
|-----|-----------|:-----------------:|
| NOAA Aviation Weather Center | METAR e TAF | Não |
| DECEA GeoAISWeb WMS | Cartas WAC e REA sobrepostas no mapa | Não |
| OpenAIP | Espaços aéreos | Sim (gratuita) |
| Open-Topo-Data | Elevação do terreno para perfil de rota | Não |
| OpenStreetMap | Mapa base | Não |
| Esri World Imagery | Mapa satélite | Não |

### Variáveis de ambiente

```env
EXPO_PUBLIC_OPENAIP_KEY=sua_chave_aqui
```

Chave gratuita obtida em [openAIP.net](https://openAIP.net).

Para builds EAS:
```bash
npx eas env:create --name EXPO_PUBLIC_OPENAIP_KEY --value SUA_CHAVE --scope project --visibility plaintext --environment production --environment preview
```

### Decisões técnicas importantes

**`newArchEnabled: false` no app.json, não alterar**  
O MapLibre v10 é incompatível com a nova arquitetura do React Native. Mudar essa configuração quebra o mapa completamente.

**MapLibre não funciona no Expo Go**  
É obrigatório usar um APK gerado pelo EAS com `developmentClient: true`. Não adianta escanear o QR code pelo Expo Go.

**WMS do DECEA dividido por região**  
A URL do WMS com todos os 46 layers WAC concatenados é longa demais e o servidor rejeita. A solução foi dividir em 5 grupos regionais (norte, nordeste, centro, sudeste, sul), cada um como uma source separada no MapLibre.

**react-native-reanimated na versão 3.x**  
A versão 4.x exige nova arquitetura, incompatível com MapLibre v10. Manter em 3.19.4.

**Heurística SB para METAR**  
Apenas aeródromos com prefixo `SB` têm estação meteorológica ativa no AWC. Os demais mostram "Sem estação meteorológica" sem tentar a requisição.

**Zustand + AsyncStorage para estado da rota**  
Zustand gerencia o estado global reativo da rota (todos os componentes atualizam automaticamente quando um waypoint é adicionado). O middleware `persist` salva automaticamente no AsyncStorage, a rota sobrevive ao fechamento do app, assim como no ForeFlight e Garmin Pilot. O `modoRota` não é persistido intencionalmente: ao reabrir o app o piloto começa sempre no modo normal.

**SQLite para favoritos**  
Favoritos usam SQLite (`expo-sqlite`) por ser um banco de dados relacional completo, adequado para dados estruturados com múltiplas colunas que precisam de queries eficientes.

### Estrutura de pastas

```
NavGate/
├── src/
│   ├── app/
│   │   ├── _layout.tsx              ← configuração de rotas e gestos
│   │   ├── (tabs)/
│   │   │   ├── index.tsx            ← Busca de aeródromos
│   │   │   ├── mapa.tsx             ← Mapa principal
│   │   │   ├── meteorologia.tsx     ← Dashboard meteorológico
│   │   │   └── favoritos.tsx
│   │   ├── aerodromo/[icao].tsx     ← Detalhes do aeródromo
│   │   └── metar/[icao].tsx         ← METAR / TAF
│   ├── features/
│   │   ├── aerodromos/              ← base local de 4.609 aeródromos (JSON)
│   │   ├── favoritos/               ← SQLite + Zustand
│   │   ├── metar/                   ← parser METAR + NOAA + componentes
│   │   ├── mapa/                    ← MapLibre + WMS DECEA + painel de camadas
│   │   └── rota/                    ← planejamento, perfil de terreno, cálculo de voo
│   └── services/
│       └── api/                     ← cliente HTTP compartilhado
├── scripts/
│   ├── airports.csv                 ← base mundial de aeródromos (OurAirports)
│   └── processar_aerodromos.js      ← filtra apenas aeródromos brasileiros para o JSON
└── assets/
```

### Como rodar

**1. Instalar dependências**
```bash
npm install
```

**2. Configurar variável de ambiente**
```bash
# Criar arquivo .env na raiz com:
EXPO_PUBLIC_OPENAIP_KEY=sua_chave_aqui
```

**3. Gerar o APK de development**
```bash
# Muda package no app.json para com.navgate.app.dev
npx eas build -p android --profile development
```

**4. Instalar o APK no celular e iniciar o servidor**
```bash
npx expo start --clear
```

### Builds separados para dev e produção

Os dois APKs coexistem no celular usando packages diferentes:

| | Package | Uso |
|---|---|---|
| Development | `com.navgate.app.dev` | Conecta com o servidor local para desenvolvimento |
| Preview | `com.navgate.app` | Standalone, para distribuição ao usuário final |

Para gerar o preview:
```bash
# Confirma package como com.navgate.app no app.json
npx eas build -p android --profile preview
```
