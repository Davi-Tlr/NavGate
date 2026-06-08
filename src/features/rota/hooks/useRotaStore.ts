// Estado global da rota com persistência via AsyncStorage; expõe cálculos derivados via useRota.
import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Aerodromo } from '../../aerodromos/types';
import { Waypoint, Rota } from '../types';
import { calcularRota, rotaParaGeoJSON } from '../services/rotaService';

interface RotaState {
    waypoints: Waypoint[];
    modoRota: boolean;
    onboardingVisto: boolean;
    velocidadeCruzeiro: string;
    consumoHorario: string;
    horaSaida: string;
    adicionarAerodromo: (aerodromo: Aerodromo) => void;
    adicionarPontoLivre: (coords: [number, number]) => void;
    removerWaypoint: (id: string) => void;
    limparRota: () => void;
    setModoRota: (ativo: boolean) => void;
    marcarOnboardingVisto: () => void;
    reordenarWaypoints: (waypoints: Waypoint[]) => void;
    renomearWaypoint: (id: string, novoLabel: string) => void;
    setVelocidadeCruzeiro: (v: string) => void;
    setConsumoHorario: (v: string) => void;
    setHoraSaida: (v: string) => void;
}

export const useRotaStore = create<RotaState>()(
    persist(
        (set) => ({
            waypoints: [],
            modoRota: false,
            onboardingVisto: false,
            velocidadeCruzeiro: '',
            consumoHorario: '',
            horaSaida: '',

            adicionarAerodromo: (aerodromo) => {
                set(state => {
                    const ultimo = state.waypoints[state.waypoints.length - 1];
                    if (ultimo?.aerodromo?.icao === aerodromo.icao) return state;
                    return {
                        waypoints: [
                            ...state.waypoints,
                            {
                                id: `${aerodromo.icao}-${Date.now()}`,
                                aerodromo,
                                label: aerodromo.icao,
                            }
                        ]
                    };
                });
            },

            adicionarPontoLivre: (coords) => {
                set(state => {
                    const numero = state.waypoints.filter(w => !w.aerodromo).length + 1;
                    return {
                        waypoints: [
                            ...state.waypoints,
                            {
                                id: `ponto-${Date.now()}`,
                                coordenadas: coords,
                                label: `Ponto ${numero}`,
                            }
                        ]
                    };
                });
            },

            removerWaypoint: (id) => {
                set(state => ({ waypoints: state.waypoints.filter(w => w.id !== id) }));
            },

            limparRota: () => set({ waypoints: [] }),
            setModoRota: (ativo) => set({ modoRota: ativo }),
            marcarOnboardingVisto: () => set({ onboardingVisto: true }),
            reordenarWaypoints: (waypoints: Waypoint[]) => set({ waypoints }),

            renomearWaypoint: (id: string, novoLabel: string) => {
                set(state => ({
                    waypoints: state.waypoints.map(w =>
                        w.id === id ? { ...w, label: novoLabel } : w
                    )
                }));
            },

            setVelocidadeCruzeiro: (v) => set({ velocidadeCruzeiro: v }),
            setConsumoHorario: (v) => set({ consumoHorario: v }),
            setHoraSaida: (v) => set({ horaSaida: v }),
        }),
        {
            name: 'navgate-rota',
            storage: createJSONStorage(() => AsyncStorage),
            // modoRota é excluído do partialize intencionalmente: o app sempre inicia com o
            // modo de rota desativado, independente do estado anterior. Persistir isso causaria
            // o painel de rota abrir automaticamente ao reabrir o app, o que é indesejado.
            partialize: (state) => ({
                waypoints: state.waypoints,
                onboardingVisto: state.onboardingVisto,
                velocidadeCruzeiro: state.velocidadeCruzeiro,
                consumoHorario: state.consumoHorario,
                horaSaida: state.horaSaida,
            }),
        }
    )
);

export function useRota() {
    const store = useRotaStore();
    const { waypoints } = store;

    const rota = useMemo<Rota | null>(
        () => waypoints.length >= 2 ? calcularRota(waypoints) : null,
        [waypoints]
    );
    const linhaGeoJSON = useMemo(() => rotaParaGeoJSON(waypoints), [waypoints]);

    return { ...store, rota, linhaGeoJSON, temRota: waypoints.length >= 2 };
}