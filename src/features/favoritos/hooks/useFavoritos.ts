import { create } from 'zustand';
import { Aerodromo } from '../../aerodromos/types';
import { Favorito } from '../types';
import { favoritoService } from '../services/favoritoService';
import { useEffect } from 'react';

interface FavoritosState {
  favoritos: Favorito[];
  isLoading: boolean;
  carregado: boolean;
  fetchFavoritos: () => Promise<void>;
  adicionarFavorito: (aerodromo: Aerodromo) => Promise<void>;
  removerFavorito: (icao: string) => Promise<void>;
  isFavorito: (icao: string) => boolean;
}

const useFavoritosStore = create<FavoritosState>((set, get) => ({
  favoritos: [],
  isLoading: false,
  carregado: false,

  fetchFavoritos: async () => {
    set({ isLoading: true });
    try {
      await favoritoService.initDb();
      const favs = await favoritoService.listarFavoritos();
      set({ favoritos: favs, isLoading: false, carregado: true });
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      set({ isLoading: false, carregado: true });
    }
  },

  adicionarFavorito: async (aerodromo: Aerodromo) => {
    try {
      await favoritoService.adicionarFavorito(aerodromo);
      const favs = await favoritoService.listarFavoritos();
      set({ favoritos: favs });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
    }
  },

  removerFavorito: async (icao: string) => {
    try {
      await favoritoService.removerFavorito(icao);
      const favs = await favoritoService.listarFavoritos();
      set({ favoritos: favs });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  },

  isFavorito: (icao: string) => {
    return get().favoritos.some((f) => f.icao === icao);
  },
}));

export const useFavoritos = () => {
  const store = useFavoritosStore();

  useEffect(() => {
    const { carregado, isLoading, fetchFavoritos } = useFavoritosStore.getState();
    if (!carregado && !isLoading) {
      fetchFavoritos();
    }
  }, []);

  return store;
};
