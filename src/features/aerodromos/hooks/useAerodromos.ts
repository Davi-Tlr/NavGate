import { useState, useCallback } from 'react';
import { Aerodromo } from '../types';
import { buscarAerodromos } from '../services/aerodromoService';

export function useAerodromos() {
    const [resultados, setResultados] = useState<Aerodromo[]>([]);
    const [termo, setTermo] = useState('');

    const buscar = useCallback((texto: string) => {
        setTermo(texto);
        setResultados(buscarAerodromos(texto));
    }, []);

    const limpar = useCallback(() => {
        setTermo('');
        setResultados([]);
    }, []);

    return {
        termo,
        resultados,
        buscar,
        limpar,
        temResultados: resultados.length > 0,
    };
}