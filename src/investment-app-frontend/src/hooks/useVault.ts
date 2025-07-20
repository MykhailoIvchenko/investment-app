import { useEffect, useState } from 'react';
import { HttpAgent, Actor, ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
// @ts-ignore
import { useIdentity } from '@nfid/identitykit/react';
import { toast } from 'react-toastify';
import { idlFactory as investmentAppIdlFactory } from '../../../declarations/investment-app-backend';

const INVESTMENT_APP_CANISTER_ID = 'uzt4z-lp777-77774-qaabq-cai';
// const HOST = 'https://icp-api.io';
const HOST = 'http://localhost:4943';

type Result<T, E> = { Ok: T } | { Err: E };

export const useVault = () => {
  const identity = useIdentity();
  const [vaultActor, setVaultActor] = useState<ActorSubclass<any> | null>(null);

  const getActorAndSet = async () => {
    if (!identity) {
      setVaultActor(null);
      return;
    }

    const agent = await HttpAgent.create({ identity, host: HOST });

    //Remove on deploy to the mainnet
    agent.fetchRootKey();

    const actor = Actor.createActor(investmentAppIdlFactory, {
      agent,
      canisterId: Principal.fromText(INVESTMENT_APP_CANISTER_ID),
    });

    setVaultActor(actor);
  };

  useEffect(() => {
    getActorAndSet();
  }, [identity]);

  const deposit = async (amount: bigint) => {
    if (!vaultActor) {
      toast.error('Actor not initialized');
      return false;
    }
    try {
      const result: Result<bigint, string> =
        await vaultActor.deposit_to_vault_account(amount);
      if ('Ok' in result) {
        toast.success('Deposit successful');
        return true;
      } else {
        toast.error(`Deposit failed: ${result.Err}`);
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Error during deposit');
      return false;
    }
  };

  const withdraw = async (fromSubaccount: Uint8Array, amount: bigint) => {
    if (!vaultActor) {
      toast.error('Actor not initialized');
      return false;
    }
    try {
      const result: Result<bigint, string> =
        await vaultActor.withdraw_from_vault(fromSubaccount, amount);
      if ('Ok' in result) {
        toast.success('Withdrawal successful');
        return true;
      } else {
        toast.error(`Withdrawal failed: ${result.Err}`);
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Error during withdrawal');
      return false;
    }
  };
  const configureRecurring = async (
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    amount: bigint
  ) => {
    if (!vaultActor) {
      toast.error('Actor not initialized');
      return false;
    }
    const frequencyVariant = (() => {
      switch (frequency) {
        case 'daily':
          return { daily: null };
        case 'weekly':
          return { weekly: null };
        case 'monthly':
          return { monthly: null };
        case 'quarterly':
          return { quarterly: null };
      }
    })();

    try {
      const result: Result<bigint, string> =
        await vaultActor.create_recurrent_deposit(amount, frequencyVariant);
      if ('Ok' in result) {
        toast.success('Recurring configuration updated');
        return true;
      } else {
        toast.error(`Failed to update recurring config: ${result.Err}`);
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Error during recurring configuration');
      return false;
    }
  };

  return {
    deposit,
    withdraw,
    configureRecurring,
    isReady: !!vaultActor,
  };
};
