import { Address, Hex } from "viem";

export type AccountType =
  | "erc7579-implementation"
  | "kernel"
  | "safe"
  | "nexus";

export type Account = {
  address: Address;
  initCode?: Hex;
  type: AccountType;
  deployedOnChains: Number[];
};

export type Execution = {
  target: Address;
  value: BigInt;
  callData: Hex;
};

export type Chain = {
  id: number;
  rpc: string;
  bundler: string;
};
