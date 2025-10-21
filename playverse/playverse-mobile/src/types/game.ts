export type Game = {
  id: string;
  title: string;
  genre: string;
  rating: number;
  description: string;
  status?: "valid" | "expired";
  validUntil?: string;
  rentalPrice?: string;
  purchasePrice?: string;
};
