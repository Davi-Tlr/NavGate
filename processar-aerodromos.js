const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'airports.csv');
const csv = fs.readFileSync(csvPath, 'utf8');

// Parser de CSV que lida corretamente com campos entre aspas
function parseLinha(linha) {
  const cols = [];
  let atual = '';
  let dentroAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const char = linha[i];
    if (char === '"') {
      dentroAspas = !dentroAspas;
    } else if (char === ',' && !dentroAspas) {
      cols.push(atual);
      atual = '';
    } else {
      atual += char;
    }
  }
  cols.push(atual);
  return cols;
}

const linhas = csv.split('\n');
const cabecalho = parseLinha(linhas[0]); // usa o parser no cabeçalho também

console.log('Cabeçalho:', cabecalho.slice(0, 10));

const idx = {
  ident: cabecalho.indexOf('ident'),
  type: cabecalho.indexOf('type'),
  name: cabecalho.indexOf('name'),
  lat: cabecalho.indexOf('latitude_deg'),
  lon: cabecalho.indexOf('longitude_deg'),
  elevation: cabecalho.indexOf('elevation_ft'),
  municipality: cabecalho.indexOf('municipality'),
  country: cabecalho.indexOf('iso_country'),
  region: cabecalho.indexOf('iso_region'),
  iata: cabecalho.indexOf('iata_code'),
};

console.log('Índices detectados:', idx);

const aerodromos = [];

for (let i = 1; i < linhas.length; i++) {
  const linha = linhas[i];
  if (!linha.trim()) continue;

  const cols = parseLinha(linha);

  if (cols[idx.country] !== 'BR') continue;

  const tipo = cols[idx.type];
  if (!['large_airport', 'medium_airport', 'small_airport', 'heliport', 'seaplane_base'].includes(tipo)) continue;

  const icao = cols[idx.ident];
  if (!icao) continue;

  // Filtra apenas aeródromos com código ICAO oficial (começam com letra, não com número)
  if (!icao || icao.startsWith('BR-') || /^\d/.test(icao)) continue;

  aerodromos.push({
    icao: icao,
    nome: cols[idx.name] || '',
    tipo: tipo,
    latitude: parseFloat(cols[idx.lat]) || 0,
    longitude: parseFloat(cols[idx.lon]) || 0,
    altitude_ft: parseInt(cols[idx.elevation]) || 0,
    municipio: cols[idx.municipality] || '',
    regiao: cols[idx.region] || '',
    iata: cols[idx.iata] || '',
  });
}

const saida = path.join(__dirname, 'assets', 'data', 'aerodromos_br.json');
fs.writeFileSync(saida, JSON.stringify(aerodromos, null, 2), 'utf8');

console.log(`✅ ${aerodromos.length} aeródromos brasileiros salvos em assets/data/aerodromos_br.json`);
