export type BillingCycle = "monthly" | "annually";

export interface Plan {
  name: string;
  description: string;
  price: {
    monthly: string;
    annually: string;
  };
  priceIds: {
    monthly: string;
    annually: string;
  },
  popular?: boolean;
  features: string[];
}
