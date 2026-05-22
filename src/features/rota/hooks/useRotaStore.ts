import { create } from 'zustand';
import { Aerodromo } from '../../aerodromos/types';
import { Waypoint, Rota } from '../types';
import { calcularRota, rotaParaGeoJSON } from '../services/rotaService';

interface RotaState {
    waypoints: Waypoint[];
    modoRota: boolean;
    onboardingVisto: boolean;
    adicionarAerodromo: (aerodromo: Aerodromo) => void;
    adicionarPontoLivre: (coords: [number, number]) => void;
    removerWaypoint: (id: string) => void;
    limparRota: () => void;
    setModoRota: (ativo: boolean) => void;
    marcarOnboardingVisto: () => void;
    reordenarWaypoints: (waypoints: Waypoint[]) => void;
    renomearWaypoint: (id: string, novoLabel: string) => void;
}

export const useRotaStore = create<RotaState>((set, get) => ({
    waypoints: [],
    modoRota: false,
    onboardingVisto: false,

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
}));


export function useRota() {
    const store = useRotaStore();
    const { waypoints } = store;

    const rota: Rota | null = waypoints.length >= 2 ? calcularRota(waypoints) : null;
    const linhaGeoJSON = rotaParaGeoJSON(waypoints);

    return { ...store, rota, linhaGeoJSON, temRota: waypoints.length >= 2 };
}