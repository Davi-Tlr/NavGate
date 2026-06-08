import * as SQLite from 'expo-sqlite';
import { Aerodromo } from '../../aerodromos/types';
import { Favorito } from '../types';

// SQLite foi escolhido em vez de AsyncStorage porque permite consultas relacionais, ordenação
// por data e remoção individual por chave primária sem carregar todos os registros na memória.
const DATABASE_NAME = 'navgate.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const favoritoService = {
  async getDb() {
    if (dbInstance) return dbInstance;

    try {
      dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
      return dbInstance;
    } catch (error) {
      console.error('[DATABASE] Erro ao abrir banco:', error);
      throw error;
    }
  },

  async initDb() {
    try {
      const db = await this.getDb();
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS favoritos (
          icao TEXT PRIMARY KEY NOT NULL,
          nome TEXT NOT NULL,
          tipo TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          altitude_ft INTEGER NOT NULL,
          municipio TEXT NOT NULL,
          regiao TEXT NOT NULL,
          iata TEXT,
          data_adicao TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.error('[DATABASE] Erro na inicialização:', error);
    }
  },

  async listarFavoritos(): Promise<Favorito[]> {
    const db = await this.getDb();
    return await db.getAllAsync<Favorito>('SELECT * FROM favoritos ORDER BY data_adicao DESC');
  },

  async adicionarFavorito(aerodromo: Aerodromo): Promise<void> {
    const db = await this.getDb();
    const dataAdicao = new Date().toISOString();

    await db.runAsync(
      `INSERT OR REPLACE INTO favoritos (icao, nome, tipo, latitude, longitude, altitude_ft, municipio, regiao, iata, data_adicao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        aerodromo.icao,
        aerodromo.nome,
        aerodromo.tipo,
        aerodromo.latitude,
        aerodromo.longitude,
        aerodromo.altitude_ft,
        aerodromo.municipio,
        aerodromo.regiao,
        aerodromo.iata ?? null,
        dataAdicao,
      ]
    );
  },

  async removerFavorito(icao: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM favoritos WHERE icao = ?', [icao]);
  },
};
