import { useState, useCallback } from 'react';
import { MetarProcessado } from '../types';
import { buscarMetar, buscarTaf } from '../services/metarService';

interface EstadoMetar {
    loading: boolean;
    metar: MetarProcessado | null;
    taf: string | null;
    erro: string | null;
}

export function useMetar() {
    const [estado, setEstado] = useState<EstadoMetar>({
        loading: false,
        metar: null,
        taf: null,
        erro: null,
    });

    const buscar = useCallback(async (icao: string) => {
        setEstado(e => ({ ...e, loading: true, erro: null }));

        try {
            const [resultadoMetar, tafRaw] = await Promise.all([
                buscarMetar(icao),
                buscarTaf(icao),
            ]);

            setEstado({
                loading: false,
                metar: resultadoMetar.processado,
                taf: tafRaw,
                erro: null,
            });
        } catch (e) {
            const mensagem = e instanceof Error ? e.message : 'Erro desconhecido';
            setEstado(e => ({
                ...e,
                loading: false,
                erro: mensagem,
                metar: null,
            }));
        }
    }, []);

    return { ...estado, buscar };
}
