# NavGate — Relatório Técnico de Progresso
**Data:** 05 de Abril de 2026
**Status do Projeto:** v0.5 — Funcionalidades Core Estabilizadas

---

## 🏗️ Arquitetura Adotada
O projeto segue o padrão **Feature-Based com Camada de Serviços**, garantindo alta escalabilidade e facilidade de manutenção.

### Estrutura de Pastas
- `src/app`: Rotas e telas (Expo Router).
- `src/features`: Lógica de negócio dividida por funcionalidades (Busca, Favoritos, Metar, Mapa).
- `src/services`: Camadas de infraestrutura (API Client, SQLite Storage).

---

## ✅ Funcionalidades Implementadas

### 1. Busca Inteligente de Aeródromos
- **Dados:** Base local de 4.609 aeródromos brasileiros (JSON).
- **Performance:** Filtro instantâneo por ICAO, Nome ou Município.
- **UI:** Lista otimizada com `FlatList` e cards informativos.

### 2. Detalhes e Meteorologia (METAR/TAF)
- **Navegação:** Rotas dinâmicas `/aerodromo/[icao]`.
- **Parser:** Interpretador de mensagens METAR brutas para dados estruturados (Vento, Nuvens, QNH).
- **Inteligência:** Classificação automática de condições de voo (VFR, MVFR, IFR, LIFR) com indicação visual por cores.
- **Resiliência:** Sistema de Mock automático caso a chave da REDEMET não esteja configurada.

### 3. Sistema de Favoritos (Persistência)
- **Banco de Dados:** Implementação de `expo-sqlite` para armazenamento permanente.
- **Estado Global:** Uso de `Zustand` para sincronização reativa entre telas.
- **Funcionalidade:** Botão de "Coração" nos detalhes e aba exclusiva de Favoritos.

### 4. Dashboard de Meteorologia
- **Visão Geral:** Aba que resume a condição climática de todos os aeródromos favoritos simultaneamente.
- **Cards Dinâmicos:** Cada card gerencia seu próprio ciclo de vida de busca de dados.

---

## 🛠️ Infraestrutura e Estabilização
- **API Client:** Centralização de chaves e URLs base em um único serviço (`apiClient.ts`).
- **Development Build:** Configuração de `eas.json` e alinhamento de dependências nativas (`expo-linking`, `expo-constants`).
- **Adapter Pattern:** Preparação do componente de Mapa para suportar MapLibre sem quebrar o ambiente de desenvolvimento.

---

## 🚀 Próximos Passos Planejados
1. **Ativação do Mapa:** Substituir o esqueleto pela renderização real do MapLibre.
2. **Camadas Espaciais:** Integração com OpenAIP para exibir espaços aéreos brasileiros.
3. **NOTAMs:** Integração com a API AISWEB para alertas de segurança.
