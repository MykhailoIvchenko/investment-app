import { IDL } from '@dfinity/candid';

export const ckbtcIdlFactory = () =>
  IDL.Service({
    icrc1_balance_of: IDL.Func(
      [
        IDL.Record({
          owner: IDL.Principal,
          subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
        }),
      ],
      [IDL.Nat],
      ['query']
    ),
    icrc1_approve: IDL.Func(
      [
        IDL.Record({
          spender: IDL.Principal,
          amount: IDL.Nat,
          from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          fee: IDL.Opt(IDL.Nat),
          memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
          created_at_time: IDL.Opt(IDL.Nat64),
          expires_at: IDL.Opt(IDL.Nat64),
        }),
      ],
      [IDL.Variant({ Ok: IDL.Nat, Err: IDL.Text })],
      []
    ),
  });
