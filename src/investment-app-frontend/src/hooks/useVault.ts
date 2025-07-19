import { useEffect, useState } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
// @ts-ignore
import { useIdentity } from '@nfid/identitykit/react';
// import { vaultIdlFactory } from '../../../declarations/vault';
import { toast } from 'react-toastify';

const vaultIdlFactory = {};
const VAULT_CANISTER_ID = 'xxx...cai';
const HOST = 'https://icp-api.io';

export const useVault = () => {
  const identity = useIdentity();
  const [vaultActor, setVaultActor] = useState<any>(null);

  const getActorAndSet = async () => {
    const agent = await HttpAgent.create({ identity, host: HOST });

    const actor = Actor.createActor(vaultIdlFactory, {
      agent,
      canisterId: Principal.fromText(VAULT_CANISTER_ID),
    });

    setVaultActor(actor);
  };

  useEffect(() => {
    if (!identity) {
      setVaultActor(null);
      return;
    }

    getActorAndSet();
  }, [identity]);

  const deposit = async (amount: bigint) => {
    if (!vaultActor) return;
    try {
      const result = await vaultActor.deposit(amount);
      if ('Ok' in result) {
        toast.success('Deposit successful');
        return true;
      } else {
        toast.error('Deposit failed');
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Error during deposit');
      return false;
    }
  };

  const withdraw = async (amount: bigint) => {
    if (!vaultActor) return;
    try {
      const result = await vaultActor.withdraw(amount);
      if ('Ok' in result) {
        toast.success('Withdrawal successful');
        return true;
      } else {
        toast.error('Withdrawal failed');
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Error during withdrawal');
      return false;
    }
  };

  const configureRecurring = async (
    intervalSeconds: bigint,
    amount: bigint
  ) => {
    if (!vaultActor) return;
    try {
      const result = await vaultActor.configure_recurring({
        interval_seconds: intervalSeconds,
        amount,
      });
      if ('Ok' in result) {
        toast.success('Recurring config updated');
        return true;
      } else {
        toast.error('Failed to update recurring config');
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Error during recurring config update');
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
