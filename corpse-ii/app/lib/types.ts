interface CategoryConfig {
  noValuation?: boolean;
  destinationColumn?: string;
  isPositiveStat?: boolean;
  isRateStat: boolean;
  formula?: string;
  denominator?: string;
}

type CategoriesConfig = {
  base_projection: string;
  categories: Record<string, CategoryConfig>;
};
