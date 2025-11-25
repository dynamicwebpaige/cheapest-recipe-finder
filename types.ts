export interface Ingredient {
  name: string;
  price: string;
  store: string;
}

export interface Store {
  name: string;
  lat: number;
  lng: number;
  items: string[];
}

export interface SearchResult {
  ingredients: Ingredient[];
  stores: Store[];
  summary: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
