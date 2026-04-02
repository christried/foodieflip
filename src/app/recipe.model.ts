export interface Recipe {
  id: string;
  title: string;
  shortTitle: string;
  time: number;
  imageExtension: string;
  imageUrl: string;
  fullsizeUrl: string;
  imageAlt: string;
  ingredients: string[];
  instructions: string[];
  tagsPublic: string[];
  tagsInternal: string[];
  upvotes: number;
  downvotes: number;
  submittedBy: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string | null;
  approvedBy?: string | null;
  reviewNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeSubmission {
  title: string;
  ingredients: string[];
  instructions: string[];
  time: number;
  submittedBy: string;
  image?: File;
}
