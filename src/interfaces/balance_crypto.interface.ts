import { Balance } from "./balance.interface";

export interface BalanceCrypto {
  coin: string;
  blockchain: string;
  icon: string;
  balance: number;
  tokens: Array<Balance>;
}
