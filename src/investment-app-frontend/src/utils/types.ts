import { ReactNode } from 'react';

export interface IUser {
  username?: string;
  principalId?: string;
}

export type ReactChildren = ReactNode | ReactNode[];
