export interface WorldConfig {
  name: string;
  description: string;
  groundColor: string;
  skyColor: string;
  gridColor: string;
  fogDensity: number;
  partColor?: string; // Color for scattered blocks
}

export interface GenerationResponse {
  name: string;
  description: string;
  visuals: {
    groundColor: string;
    skyColor: string;
    gridColor: string;
    fogDensity: number;
    partColor: string;
  };
}
