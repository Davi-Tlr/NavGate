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
        loading: true,
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
        } catch (err) {
            const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
            setEstado(prev => ({
                ...prev,
                loading: false,
                erro: mensagem,
                metar: null,
            }));
        }
    }, []);

    return { ...estado, buscar };
}
