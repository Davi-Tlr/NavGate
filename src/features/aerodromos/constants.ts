import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AerodromoTipo } from './types';

export const TIPO_LABEL: Record<AerodromoTipo, string> = {
    large_airport: 'Aeroporto Internacional',
    medium_airport: 'Aeroporto Regional',
    small_airport: 'Aeródromo',
    heliport: 'Heliporto',
    seaplane_base: 'Base de Hidroaviões',
};

export const TIPO_ICONE: Record<AerodromoTipo, ComponentProps<typeof Ionicons>['name']> = {
    large_airport: 'airplane',
    medium_airport: 'airplane-outline',
    small_airport: 'airplane-outline',
    heliport: 'medical-outline',
    seaplane_base: 'boat-outline',
};
