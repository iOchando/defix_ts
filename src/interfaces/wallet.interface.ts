import { Credential } from "../interfaces/credential.interface";

export interface Wallet {
  defixId: string;
  credentials: Array<Credential>;
}
