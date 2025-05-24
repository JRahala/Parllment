export interface MP {
  name: string;
  political_party: string;
  interests: string[];
  imageUrl?: string;
}

export interface MPWithOpinion extends MP {
  rating: number;
  snippet: string;
}
