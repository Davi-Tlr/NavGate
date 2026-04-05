import { create } from 'zustand';
import { Aerodromo } from '../../aerodromos/types';
import { Favorito } from '../types';
import { favoritoService } from '../services/favoritoService';
import { useEffect } from 'react';

interface FavoritosState {
  favoritos: Favorito[];
  isLoading: boolean;
  fetchFavoritos: () => Promise<void>;
  adicionarFavorito: (aerodromo: Aerodromo) => Promise<void>;
  removerFavorito: (icao: string) => Promise<void>;
  isFavorito: (icao: string) => boolean;
}

const useFavoritosStore = create<FavoritosState>((set, get) => ({
  favoritos: [],
  isLoading: false,

  fetchFavoritos: async () => {
    set({ isLoading: true });
    try {
      await favoritoService.initDb();
      const favs = await favoritoService.listarFavoritos();
      set({ favoritos: favs, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      set({ isLoading: false });
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
    // Inicializa se necessário
    if (store.favoritos.length === 0 && !store.isLoading) {
      store.fetchFavoritos();
    }
  }, []);

  return store;
};
