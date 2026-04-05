# NavGate — Contexto Completo para IA
> Use este arquivo como primeiro prompt ao iniciar uma sessão com qualquer IA.
> Cole o conteúdo completo antes de fazer qualquer pergunta sobre o projeto.

---

## IDENTIDADE DO PROJETO

**Nome:** NavGate  
**Tipo:** Aplicativo móvel de planejamento de navegação aérea VFR para o Brasil  
**Aluno:** Davi Lucas Cassiano da Silva — Matrícula: 202408648103  
**Disciplina:** Programação Para Dispositivos Móveis em Android  
**Instituição:** Universidade Estácio de Sá — Campus Maracanã  
**Professor:** Salustiano Oliveira  
**Semestre:** 2026.1  

---

## STACK TECNOLÓGICA

| Tecnologia | Versão | Função |
|---|---|---|
| Expo SDK | 54 | Plataforma base |
| React Native | 0.81.x | Framework mobile |
| TypeScript | ~5.9.x | Linguagem |
| Expo Router | ~6.x | Navegação por arquivos |
| MapLibre React Native | ^10.4.2 | Mapas (exige Development Build) |
| expo-sqlite | ~16.0.x | Banco de dados local |
| @react-native-async-storage | 2.2.0 | Preferências simples |
| expo-location | ~19.0.x | GPS |
| react-native-chart-kit | ^6.x | Gráfico de altitude |
| react-native-svg | 15.12.x | Ícones vetoriais |
| zustand | ^5.x | Estado global |
| react-native-safe-area-context | ~5.6.x | Área segura |
| react-native-screens | ~4.16.x | Performance de navegação |

**CRÍTICO — MapLibre NÃO funciona no Expo Go.** Nem react-native-maps funciona no Expo Go com SDK 54 + New Architecture. Ambos exigem Development Build. O projeto está usando Expo Go atualmente para as features sem mapa.

---

## ARQUITETURA

### Padrão: Feature-Based com camada de serviços

```
NavGate/
├── src/
│   ├── app/                      ← Expo Router (telas)
│   │   ├── _layout.tsx           ← Layout raiz com Stack
│   │   ├── (tabs)/               ← Route Group das abas
│   │   │   ├── _layout.tsx       ← Define 4 abas
│   │   │   ├── index.tsx         ← Tela Busca (IMPLEMENTADA)
│   │   │   ├── mapa.tsx          ← Tela Mapa (esqueleto)
│   │   │   ├── meteorologia.tsx  ← Tela Tempo (esqueleto)
│   │   │   └── favoritos.tsx     ← Tela Favoritos (esqueleto)
│   │   ├── aerodromo/
│   │   │   └── [icao].tsx        ← Tela Detalhes (IMPLEMENTADA)
│   │   └── metar/
│   │       └── [icao].tsx        ← Tela METAR/TAF (IMPLEMENTADA)
│   │
│   ├── features/
│   │   ├── aerodromos/
│   │   │   ├── types.ts          ← interface Aerodromo
│   │   │   ├── hooks/useAerodromos.ts
│   │   │   └── services/aerodromoService.ts
│   │   └── metar/
│   │       ├── types.ts          ← MetarRaw, MetarProcessado, TafRaw
│   │       ├── hooks/useMetar.ts
│   │       └── services/
│   │           ├── metarService.ts  ← chama REDEMET ou mock
│   │           └── metarParser.ts   ← parser da mensagem METAR
│   │
│   ├── shared/                   ← (vazio, para uso futuro)
│   ├── services/                 ← (vazio, para uso futuro)
│   └── constants/                ← (vazio, para uso futuro)
│
├── assets/
│   └── data/
│       └── aerodromos_br.json    ← 4609 aeródromos brasileiros com ICAO oficial
│
├── processar-aerodromos.js       ← script Node que gerou o JSON (não deletar)
├── airports.csv                  ← fonte OurAirports (não deletar)
├── .env                          ← chaves de API (não vai ao Git)
├── app.json
├── package.json                  ← "main": "expo-router/entry"
└── tsconfig.json                 ← paths: "@/*": ["src/*"]
```

### Regras de arquitetura
- **Telas são burras** — só renderizam o que hooks retornam
- **Hooks gerenciam estado** — useCallback, useState, nunca lógica na tela
- **Serviços acessam dados** — único ponto de contato com APIs e arquivos
- **`@/`** é atalho para `src/` (configurado no tsconfig paths)

---

## O QUE ESTÁ IMPLEMENTADO

### ✅ Feature 1 — Busca de Aeródromos
- **Dados:** JSON local com 4609 aeródromos brasileiros (ICAO oficial, começam com S)
- **Busca:** por código ICAO, nome ou município, case-insensitive, máximo 20 resultados
- **UI:** campo de busca, FlatList com cards (emoji por tipo, ICAO, nome, cidade, altitude)
- **Arquivos:** `aerodromoService.ts`, `useAerodromos.ts`, `types.ts`, `index.tsx`

### ✅ Feature 2 — Detalhes do Aeródromo
- **Rota dinâmica:** `/aerodromo/[icao]` — recebe ICAO como parâmetro
- **UI:** ICAO + badge IATA, tipo traduzido, coordenadas formatadas, altitude em ft e m
- **Botões:** "Ver METAR/TAF" (ativo) e "Ver no Mapa" (ainda sem ação)
- **Arquivo:** `src/app/aerodromo/[icao].tsx`

### ✅ Feature 3 — METAR / TAF
- **Rota:** `/metar/[icao]`
- **Modo mock:** quando `EXPO_PUBLIC_REDEMET_KEY` está vazio, usa dados simulados reais
- **Modo real:** quando a chave estiver configurada, chama `api-redemet.decea.mil.br`
- **Parser:** converte mensagem METAR crua em dados estruturados (vento, visibilidade, nuvens, QNH, temp)
- **Classificação VFR/MVFR/IFR/LIFR:** baseada em visibilidade e teto de nuvens
- **UI:** badge colorido de condição, condições atuais, mensagem original, TAF
- **Arquivos:** `metarParser.ts`, `metarService.ts`, `useMetar.ts`, `metar/[icao].tsx`

---

## O QUE FALTA IMPLEMENTAR (em ordem)

### 🔄 Próximo — Feature 4: Favoritos
- Salvar aeródromos favoritos usando `expo-sqlite`
- Tela `favoritos.tsx` com lista dos salvos
- Botão "Favoritar" na tela de detalhes do aeródromo
- Hook `useFavoritos.ts` + serviço `favoritoService.ts`

### 🔄 Feature 5 — Mapa (requer Development Build)
- **AVISO CRÍTICO:** MapLibre NÃO funciona no Expo Go. Requer gerar Development Build via EAS
- Implementar com Adapter Pattern: componente `MapaBase.tsx` que isola a biblioteca
- Tiles do OpenTopoMap (gratuito, sem API key): `https://tile.opentopomap.org/{z}/{x}/{y}.png`
- Marcadores dos aeródromos no mapa
- Espaços aéreos do OpenAIP sobrepostos como GeoJSON
- Botão "Ver no Mapa" na tela de detalhes deve navegar para o mapa centralizado no aeródromo

### 🔄 Feature 6 — Tela Meteorologia (tab)
- A aba "Tempo" atualmente é esqueleto
- Deve mostrar METAR de aeródromos favoritos ou recentes
- Lista com condição VFR/MVFR/IFR de múltiplos aeródromos

---

## VARIÁVEIS DE AMBIENTE (.env)

```
EXPO_PUBLIC_REDEMET_KEY=        ← vazio = usa mock. Preenchido = dados reais
EXPO_PUBLIC_AISWEB_KEY=         ← ainda não usado no código
EXPO_PUBLIC_OPENAIP_KEY=        ← ainda não usado no código
```

**Status das chaves:**
- REDEMET: cadastro suspenso por manutenção. Alternativa: abrir chamado SAC em https://servicos.decea.mil.br/sac/?a=atd&c=331
- AISWEB: mesmo problema, mesmo SAC
- OpenAIP: funcional, cadastrar em https://www.openaip.net

---

## TEMA VISUAL

```javascript
// Cores do projeto
backgroundColor: '#0a0f1e'    // fundo principal (azul muito escuro)
cardBackground:  '#1a2035'    // fundo de cards
primaryBlue:     '#4A9EFF'    // azul principal, ICAO, botões
inactiveGray:    '#6B7280'    // textos secundários
borderColor:     '#1a2035'    // bordas sutis

// Cores de condição VFR
VFR:  '#22C55E'  // verde
MVFR: '#3B82F6'  // azul
IFR:  '#EF4444'  // vermelho
LIFR: '#A855F7'  // roxo
```

---

## COMO RODAR O PROJETO

```bash
# Desenvolvimento normal (sem mapa)
npx expo start --clear

# Quando for implementar o mapa — gerar Development Build (1x)
npm install -g eas-cli
eas login
eas build -p android --profile development
# Instala o APK gerado no celular
# A partir daí usa npx expo start normalmente
```

---

## CONTEXTO DO USUÁRIO (parte interessada)

- O amigo piloto usa o aeródromo SIXE (Aeroclube de Eldorado do Sul, RS)
- Rota de exemplo: SIXE → SSNG (Montenegro, RS)
- Preocupação real: rota em linha reta passa sobre presídio (área restrita R)
- Necessidade: visualizar espaços aéreos restritos no mapa para desviar manualmente
- Unidades preferidas: velocidade em nós (kt), altitude em pés (ft), visibilidade em km/m

---

## DECISÕES DE ARQUITETURA JÁ TOMADAS (não reverter)

1. **Aeródromos sem ICAO oficial filtrados** — só ficaram os 4609 com código começando em S
2. **Mock automático do METAR** — detecta chave vazia/ausente e usa dados simulados
3. **`autoCapitalize` removido** — busca converte para maiúsculas no código, não no teclado
4. **New Architecture habilitada** — `newArchEnabled: true` no app.json
5. **Expo Router com `src/app/`** — `"main": "expo-router/entry"` no package.json
6. **`scheme: "navgate"`** no app.json — obrigatório para Expo Router funcionar
7. **MapLibre escolhido sobre react-native-maps** — ambos exigem Dev Build, MapLibre é superior para GeoJSON de espaços aéreos

---

## COMO USAR ESTE ARQUIVO

Cole o conteúdo completo deste arquivo como **primeira mensagem** de qualquer sessão.
Depois descreva o que quer fazer. Exemplo:

> "Usando o contexto acima, me ajude a implementar a feature de Favoritos com expo-sqlite,
> seguindo a mesma arquitetura já usada no projeto (hook + service + types)."
