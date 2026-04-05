// Representa os dados brutos que a REDEMET retorna
export interface MetarRaw {
    mens: string;        // ex: "SBGR 051200Z 09010KT 9999 FEW020 28/18 Q1013"
    validade: string;    // ex: "2026-04-05T12:00:00Z"
    id_localidade: string; // ex: "SBGR"
}

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

export interface TafRaw {
    mens: string;
    validade: string;
    id_localidade: string;
}