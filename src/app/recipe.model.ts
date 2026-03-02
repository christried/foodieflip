export interface Recipe {
  id: string;
  title: string;
  time: number;
  imagePath: string;
  imageUrl: string;
  fullsizeUrl: string;
  imageAlt: string;
  ingredients: string[];
  instructions: string[];
  tags_public: string[];
  tags_internal: string[];
  upvotes: number;
  downvotes: number;
  submittedBy: string;
}

export interface RecipeSubmission {
  title: string;
  ingredients: string[];
  instructions: string[];
  time: number;
  submittedBy: string;
  image?: File;
}
