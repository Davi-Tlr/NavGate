# NavGate — Guia de Chaves de API

---

## 1. REDEMET (Meteorologia Aeronáutica — METAR/TAF)

**Provedor:** DECEA / Comando da Aeronáutica (Governo Federal)  
**Status atual:** Cadastro online suspenso por manutenção  
**Custo:** Gratuito, permanente  

### Como obter

**Opção A — DECEA (o site está em manutenção)**

1. Acessa: https://servicos.decea.mil.br/sac/?a=atd&c=331
2. Abre um chamado com o seguinte texto:

**Opção B — Aguardar normalização do site**
- URL do cadastro: https://api-redemet.decea.mil.br/cadastro-api/
- Verificar periodicamente se voltou

### Como usar após receber a chave

1. Abre o arquivo `.env` na raiz do projeto
2. Substitui:
```
EXPO_PUBLIC_REDEMET_KEY=COLE_SUA_CHAVE_AQUI
```
3. Para o servidor e roda `npx expo start --clear`
4. O badge amarelo de "dados simulados" some automaticamente

### Endpoints usados no projeto
```
GET https://api-redemet.decea.mil.br/mensagens/metar/{icao}?api_key=KEY
GET https://api-redemet.decea.mil.br/mensagens/taf/{icao}?api_key=KEY
```

---

## 2. AISWEB (Dados Aeronáuticos — NOTAMs)

**Provedor:** DECEA / Comando da Aeronáutica (Governo Federal)  
**Status atual:** Mesmo problema do REDEMET — cadastro suspenso  
**Custo:** Gratuito, permanente  
**Quando será usado:** Feature de NOTAMs (ainda não implementada)

### Como obter

**Mesmo processo do REDEMET — usar o SAC DECEA:**
- URL: https://servicos.decea.mil.br/sac/?a=atd&c=331
- Mencionar no chamado que também precisa da chave AISWEB

**URL do cadastro (quando normalizar):**
https://aisweb.decea.mil.br/?i=publicacoes&p=api

**Documentação da API:**
https://documenter.getpostman.com/view/7201070/SzKQyg3H

### Como usar após receber
```
EXPO_PUBLIC_AISWEB_KEY=COLE_SUA_CHAVE_AQUI
```

---

## 3. OpenAIP (Espaços Aéreos)

**Provedor:** Comunidade open-source  
**Status atual:** FUNCIONANDO — cadastro disponível  
**Custo:** Gratuito para uso não comercial (licença CC BY-NC 4.0)  
**Quando será usado:** Feature do Mapa (espaços aéreos sobrepostos)

### Como obter (passo a passo)

1. Acessa: **https://www.openaip.net**
2. Clica em **"Sign Up"** no canto superior direito
3. Preenche nome, email e senha
4. Confirma o email (chega em alguns minutos)
5. Faz login no site
6. Clica no seu avatar/nome → **"Account Settings"** ou **"API"**
7. Gera uma API Key gratuita
8. Copia a chave

### Como usar
```
EXPO_PUBLIC_OPENAIP_KEY=COLE_SUA_CHAVE_AQUI
```

### Endpoint que será usado no projeto
```
GET https://api.core.openaip.net/api/airspaces?country=BR&apiKey=KEY
```

**Estratégia recomendada:** Baixar os espaços aéreos do Brasil uma vez,
salvar como `assets/data/airspaces_br.json` e usar localmente.
Isso evita chamadas de rede desnecessárias para dados que raramente mudam.

---

## 4. Google Maps API (OPCIONAL — só se mudar para react-native-maps)

**Status:** Não planejado. O projeto usa MapLibre (gratuito, sem API key).  
**Mencionar aqui apenas para referência caso seja necessário no futuro.**

Se por algum motivo precisar usar Google Maps:
- https://console.cloud.google.com
- Habilitar: Maps SDK for Android
- Free tier: 28.000 carregamentos de mapa/mês
- A chave vai em `app.json` como plugin, não no `.env`

---

## RESUMO DO STATUS

| API | Status | Urgência |
|---|---|---|
| REDEMET | 🟡 Pendente — abrir SAC | Alta — feature METAR usa mock |
| AISWEB | 🟡 Pendente — abrir SAC | Baixa — NOTAMs não implementado |
| OpenAIP | 🟢 Disponível agora | Média — necessário para o mapa |
| Google Maps | ⚫ Não necessário | — |

---

## ORDEM RECOMENDADA

1. **Agora:** Cadastrar no OpenAIP (5 minutos, funciona hoje)
2. **Esta semana:** Abrir chamado no SAC DECEA pedindo REDEMET + AISWEB juntos
3. **Quando chegar REDEMET:** Adicionar no `.env` e testar com dados reais
4. **Quando implementar mapa:** Usar chave OpenAIP para baixar espaços aéreos
