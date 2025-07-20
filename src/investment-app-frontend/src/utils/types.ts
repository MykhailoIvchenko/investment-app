import { ReactNode } from 'react';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface RecurringConfig {
  amount: bigint;
  frequency: Frequency;
  next_deposit_time: bigint;
}

export interface WalletConfig {
  subaccount: Uint8Array;
  account_address: string;
  recurring: RecurringConfig | null;
  balance: bigint;
}

export interface IUser {
  principalId: string;
  username: string;
  walletsConfigs: WalletConfig[];
}

export type ReactChildren = ReactNode | ReactNode[];
