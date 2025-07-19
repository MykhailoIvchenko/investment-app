import { Actor, ActorMethod, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
//@ts-ignore
import { useIdentity } from '@nfid/identitykit/react';
import { useEffect, useState } from 'react';
import { ckbtcIdlFactory } from '../../../shared/ckbtc_idl';
import { toast } from 'react-toastify';

const CKBTC_CANISTER_ID = 'mxzaz-hqaaa-aaaar-qaada-cai'; // ckTESTBTC
const VAULT_CANISTER_ID = 'xxx...cai';
const HOST = 'https://icp-api.io';

type ICRC1BalanceOf = ActorMethod<
  [
    {
      owner: Principal;
      subaccount?: Uint8Array;
    }
  ],
  bigint
>;

type ICRC1Approve = ActorMethod<
  [
    {
      from_subaccount?: Uint8Array;
      spender: Principal;
      amount: bigint;
      fee?: bigint;
      memo?: Uint8Array;
      created_at_time?: bigint;
      expires_at?: bigint;
    }
  ],
  { Ok: bigint } | { Err: unknown }
>;

type CkBTCActor = ActorSubclass<{
  icrc1_balance_of: ICRC1BalanceOf;
  icrc1_approve: ICRC1Approve;
}>;

export const useCkBTC = () => {
  const identity = useIdentity();
  const [actor, setActor] = useState<CkBTCActor | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);

  const getActorAndSet = async () => {
    if (!identity) {
      setActor(null);
      return;
    }

    try {
      const agent = await HttpAgent.create({
        host: HOST,
        identity,
      });

      const ckbtcActor = Actor.createActor(ckbtcIdlFactory, {
        agent,
        canisterId: Principal.fromText(CKBTC_CANISTER_ID),
      }) as CkBTCActor;

      setActor(ckbtcActor);
    } catch (error) {
      console.error('Failed to create ckBTC actor:', error);
      toast.error('Failed to connect to ckBTC canister');
    }
  };

  useEffect(() => {
    getActorAndSet();
  }, [identity]);

  const fetchBalance = async () => {
    if (!actor || !identity) return;

    try {
      const owner = identity.getPrincipal();
      const emptySubaccount = new Uint8Array(32);
      // const subaccountArray = Array.from(emptySubaccount);

      const result = await actor.icrc1_balance_of({
        owner,
        subaccount: emptySubaccount,
      });
      setBalance(result);
    } catch (e) {
      toast.error('Could not fetch ckBTC balance');
      console.error(e);
    }
  };

  const approveTransfer = async (amount: bigint) => {
    if (!actor || !identity?.getPrincipal) return;

    try {
      const spender = Principal.fromText(VAULT_CANISTER_ID);

      const result = await actor.icrc1_approve({
        spender,
        amount,
      });

      if ('Ok' in result) {
        toast.success('Approved successfully');
        return true;
      } else {
        toast.error('Approval failed');
        return false;
      }
    } catch (e) {
      toast.error('Error during approval');
      console.error(e);
      return false;
    }
  };

  useEffect(() => {
    if (!actor) return;
    fetchBalance();
  }, [actor]);

  return {
    balance,
    fetchBalance,
    approveTransfer,
    isReady: !!actor,
  };
};
