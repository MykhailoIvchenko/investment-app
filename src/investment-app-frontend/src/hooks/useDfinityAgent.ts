import { Actor, ActorMethod, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// @ts-ignore
import { useIdentity } from '@nfid/identitykit/react';
import { idlFactory } from '../../../declarations/investment-app-backend';

type UseDfinityAgent = () => ActorSubclass<
  Record<string, ActorMethod<unknown[], unknown>>
> | null;

// const host = 'https://icp-api.io';
const host = 'http://127.0.0.1:4943';

const canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND;

export const useDfinityAgent: UseDfinityAgent = () => {
  const identityKit = useIdentity();

  const [actor, setActor] = useState<ActorSubclass<
    Record<string, ActorMethod<unknown[], unknown>>
  > | null>(null);

  if (!identityKit) {
    return null;
  }

  const getActorAndSet = async () => {
    try {
      // if (!identityKit.agent || !identityKit?.identity) {
      //   setActor(null);
      //   return;
      // }

      // const agent = identityKit.agent;

      const agent = await HttpAgent.create({
        host,
        identity: identityKit,
      });

      //TODO: Remove it after deploy to the mainnet
      await agent.fetchRootKey();

      const generatedActor = Actor.createActor(idlFactory, {
        agent,
        canisterId: Principal.fromText(canisterId),
      });

      setActor(generatedActor);
    } catch (error) {
      console.log('Error creating actor:', error);
      toast.error('An error occured during the agent initialization');
    }
  };

  useEffect(() => {
    getActorAndSet();
  }, [identityKit]);

  return actor;
};
