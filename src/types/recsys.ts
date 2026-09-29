export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  latent3D: [number, number, number]; // [x, y, z] for 3D user space
  ratings: Record<string, number | null>; // itemId -> score (1-5 or null)
}

export interface Item {
  id: string;
  title: string;
  category: string;
  tags: string[];
  icon: string;
  coverColor: string;
  latent3D: [number, number, number]; // for 3D space
  popularity: number;
}

export interface DatasetPreset {
  id: 'netflix' | 'spotify' | 'news' | 'ecommerce' | 'custom';
  name: string;
  subtitle: string;
  icon: string;
  domain: string;
  description: string;
  users: User[];
  items: Item[];
}

export interface TrainingEpochMetric {
  epoch: number;
  rmse: number;
  mae: number;
  valRmse: number;
  valMae: number;
  loss: number;
}

export interface SvdModelResult {
  epochs: TrainingEpochMetric[];
  userFactors: Record<string, number[]>; // k-dimensional vector
  itemFactors: Record<string, number[]>; // k-dimensional vector
  predictedMatrix: Record<string, Record<string, number>>;
  k: number;
  finalRmse: number;
  finalMae: number;
}

export interface UserSimilarityResult {
  targetUserId: string;
  similarities: {
    userId: string;
    userName: string;
    similarity: number;
    commonItemsCount: number;
    isNeighbor: boolean;
  }[];
}

export interface ItemSimilarityResult {
  targetItemId: string;
  similarities: {
    itemId: string;
    itemTitle: string;
    similarity: number;
    coOccurrenceCount: number;
    isRecommended: boolean;
  }[];
}

export interface RecSysEvaluation {
  rmse: number;
  mae: number;
  hitRateAtK: number;
  precisionAtK: number;
  recallAtK: number;
  coverage: number;
  diversity: number;
  sparsity: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  metricsSnapshot?: {
    sparsity: string;
    activeUsers: number;
    activeItems: number;
  };
}
