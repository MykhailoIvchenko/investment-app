// src/hooks/useVault.ts

import { useEffect, useState } from 'react';
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
//@ts-ignore
import { useIdentity } from '@nfid/identitykit/react';
import { toast } from 'react-toastify';
import { idlFactory as vaultIdlFactory } from '../../../declarations/vault';

const VAULT_CANISTER_ID = 'xxx...cai';
const host = 'https://icp-api.io';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

type VaultActor = ActorSubclass<{
  configure_deposit: (args: {
    amount: bigint;
    frequency: Frequency;
  }) => Promise<void>;
  withdraw: () => Promise<void>;
}>;

export const useVault = () => {
  const identity = useIdentity();
  const [actor, setActor] = useState<VaultActor | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getActor = async () => {
    if (!identity) return;

    try {
      const agent = await HttpAgent.create({
        host,
        identity,
      });

      const vaultActor = Actor.createActor(vaultIdlFactory, {
        agent,
        canisterId: Principal.fromText(VAULT_CANISTER_ID),
      }) as VaultActor;

      setActor(vaultActor);
    } catch (e) {
      toast.error('Could not connect to Vault Canister');
      console.error(e);
    }
  };

  useEffect(() => {
    getActor();
  }, [identity]);

  const submitRecurringDeposit = async (
    amount: bigint,
    frequency: Frequency
  ) => {
    if (!actor) return;

    setIsLoading(true);
    try {
      await actor.configure_deposit({ amount, frequency });
      toast.success('Recurring deposit configured');
    } catch (e) {
      toast.error('Failed to configure deposit');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async () => {
    if (!actor) return;

    setIsLoading(true);
    try {
      await actor.withdraw();
      toast.success('Withdrawal successful');
    } catch (e) {
      toast.error('Withdrawal failed');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitRecurringDeposit,
    withdraw,
    isLoading,
    isReady: !!actor,
  };
};
