export interface EspacosAereosGeoJSON {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        geometry: {
            type: string;
            coordinates: unknown;
        };
        properties: Record<string, unknown> | null;
    }>;
}
