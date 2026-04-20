import { RecipeSubmission, ingredientDivision } from '../../recipe.model';
import { PRIMARY_INGREDIENT_SECTION_TITLE } from './recipe-submission-dialog.forms';

export interface IngredientSectionDraft {
  title: string;
  items: string[];
}

export interface RecipeSubmissionDraft {
  title: string;
  time: number;
  ingredients: IngredientSectionDraft[];
  instructions: string[];
  submittedBy: string;
  image?: File;
}

export function normalizeIngredientSections(
  sections: IngredientSectionDraft[],
): ingredientDivision[] {
  return sections
    .map((section, index) => {
      const normalizedItems = section.items
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      return {
        title: index === 0 ? PRIMARY_INGREDIENT_SECTION_TITLE : section.title.trim(),
        items: normalizedItems,
      };
    })
    .filter((section) => section.items.length > 0);
}

export function mapDraftToRecipeSubmission(draft: RecipeSubmissionDraft): RecipeSubmission {
  return {
    title: draft.title.trim(),
    time: draft.time,
    ingredients: normalizeIngredientSections(draft.ingredients),
    instructions: draft.instructions
      .map((instruction) => instruction.trim())
      .filter((instruction) => instruction.length > 0),
    submittedBy: draft.submittedBy.trim(),
    image: draft.image,
  };
}
