import { MetarProcessado } from '../types';

// Classifica a condição de voo baseado em visibilidade e teto de nuvens
// Esta é a classificação oficial da aviação civil
function classificarCondicao(
    visibilidadeMetros: number,
    tetoPes: number | null
): MetarProcessado['condicao'] {
    // LIFR: visibilidade < 1.6 km OU teto < 500 ft
    if (visibilidadeMetros < 1600 || (tetoPes !== null && tetoPes < 500)) {
        return 'LIFR';
    }
    // IFR: visibilidade < 5 km OU teto < 1000 ft
    if (visibilidadeMetros < 5000 || (tetoPes !== null && tetoPes < 1000)) {
        return 'IFR';
    }
    // MVFR: visibilidade < 8 km OU teto < 3000 ft
    if (visibilidadeMetros < 8000 || (tetoPes !== null && tetoPes < 3000)) {
        return 'MVFR';
    }
    // VFR: condições boas para voo visual
    return 'VFR';
}

const COR_CONDICAO: Record<MetarProcessado['condicao'], string> = {
    VFR: '#22C55E', // verde
    MVFR: '#3B82F6', // azul
    IFR: '#EF4444', // vermelho
    LIFR: '#A855F7', // roxo
};

// Traduz os prefixos de cobertura de nuvens
const COBERTURA: Record<string, string> = {
    SKC: 'Céu limpo',
    CLR: 'Céu limpo',
    NSC: 'Sem nuvens significativas',
    CAVOK: 'CAVOK — visibilidade excelente',
    FEW: 'Poucas nuvens',
    SCT: 'Nuvens esparsas',
    BKN: 'Nublado',
    OVC: 'Encoberto',
};

export function parsearMetar(raw: string, icao: string): MetarProcessado {
    const partes = raw.trim().split(/\s+/);

    let vento_direcao = 0;
    let vento_velocidade = 0;
    let vento_rajada: number | undefined;
    let visibilidadeMetros = 9999;
    let visibilidadeTexto = '+10 km';
    let temperatura = 0;
    let ponto_orvalho = 0;
    let qnh = 1013;
    let nuvens = 'Sem informação';
    let tetoPes: number | null = null;
    let hora = '--:-- UTC';

    for (const parte of partes) {
        // Hora: formato DDHHMMZ (ex: 051200Z)
        if (/^\d{6}Z$/.test(parte)) {
            const hh = parte.substring(2, 4);
            const mm = parte.substring(4, 6);
            hora = `${hh}:${mm} UTC`;
        }

        // Vento: formato DDDSSKT ou DDDSS/RRKT (ex: 09010KT ou 09010G18KT)
        if (/^\d{3}\d{2,3}(G\d{2,3})?KT$/.test(parte)) {
            vento_direcao = parseInt(parte.substring(0, 3));
            vento_velocidade = parseInt(parte.substring(3, 5));
            if (parte.includes('G')) {
                const gIdx = parte.indexOf('G');
                vento_rajada = parseInt(parte.substring(gIdx + 1, gIdx + 3));
            }
        }

        // Vento variável: VRB05KT
        if (/^VRB\d{2,3}KT$/.test(parte)) {
            vento_direcao = 0; // variável
            vento_velocidade = parseInt(parte.substring(3, 5));
        }

        // Visibilidade: número em metros (ex: 9999, 0800, 1200)
        if (/^\d{4}$/.test(parte) && !parte.endsWith('Z')) {
            visibilidadeMetros = parseInt(parte);
            if (visibilidadeMetros >= 9999) {
                visibilidadeTexto = '+10 km';
            } else if (visibilidadeMetros >= 1000) {
                visibilidadeTexto = `${(visibilidadeMetros / 1000).toFixed(1)} km`;
            } else {
                visibilidadeTexto = `${visibilidadeMetros} m`;
            }
        }

        // CAVOK (teto e visibilidade OK)
        if (parte === 'CAVOK') {
            visibilidadeMetros = 9999;
            visibilidadeTexto = '+10 km';
            nuvens = 'CAVOK — visibilidade excelente';
        }

        // Nuvens: FEW020, SCT015, BKN008, OVC003
        const matchNuvem = parte.match(/^(FEW|SCT|BKN|OVC)(\d{3})/);
        if (matchNuvem) {
            const cobertura = matchNuvem[1];
            const altitude = parseInt(matchNuvem[2]) * 100; // em centenas de pés
            nuvens = `${COBERTURA[cobertura] ?? cobertura} a ${altitude.toLocaleString('pt-BR')} ft`;
            // Teto é BKN ou OVC
            if ((cobertura === 'BKN' || cobertura === 'OVC') && tetoPes === null) {
                tetoPes = altitude;
            }
        }

        // Céu limpo
        if (['SKC', 'CLR', 'NSC'].includes(parte)) {
            nuvens = COBERTURA[parte];
        }

        // Temperatura e ponto de orvalho: TT/DD (ex: 28/18 ou M02/M05)
        if (/^M?\d{2}\/M?\d{2}$/.test(parte)) {
            const [tempStr, dewStr] = parte.split('/');
            temperatura = tempStr.startsWith('M')
                ? -parseInt(tempStr.substring(1))
                : parseInt(tempStr);
            ponto_orvalho = dewStr.startsWith('M')
                ? -parseInt(dewStr.substring(1))
                : parseInt(dewStr);
        }

        // QNH: Q1013
        if (/^Q\d{4}$/.test(parte)) {
            qnh = parseInt(parte.substring(1));
        }
    }

    const condicao = classificarCondicao(visibilidadeMetros, tetoPes);

    return {
        icao,
        raw,
        hora,
        vento_direcao,
        vento_velocidade,
        vento_rajada,
        visibilidade: visibilidadeTexto,
        temperatura,
        ponto_orvalho,
        qnh,
        condicao,
        cor_condicao: COR_CONDICAO[condicao],
        nuvens,
    };
}