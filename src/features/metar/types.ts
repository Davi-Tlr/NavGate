// Dados do METAR já processados para exibir na tela
export interface MetarProcessado {
    icao: string;
    raw: string;              // mensagem original completa
    hora: string;             // ex: "12:00 UTC"
    vento_direcao: number;    // ex: 90 (graus)
    vento_velocidade: number; // ex: 10 (nós)
    vento_rajada?: number;    // ex: 18 (nós), opcional
    visibilidade: string;     // ex: "10 km" ou "+10 km"
    temperatura: number;      // ex: 28 (°C)
    ponto_orvalho: number;    // ex: 18 (°C)
    qnh: number;              // ex: 1013 (hPa)
    condicao: 'VFR' | 'MVFR' | 'IFR' | 'LIFR'; // classificação automática
    cor_condicao: string;     // cor para exibir na UI
    nuvens: string;           // ex: "Poucas nuvens a 2000 ft"
}

