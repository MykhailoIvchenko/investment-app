import Trie "mo:base/Trie";

type Key<K> = Trie.Key<K>;


type User = {
  principal_id: Text;
  username : Text;
};

type Frequency = {
  #daily;
  #weekly;
  #monthly;
  #quarterly;
};

type RecurringConfig = {
  amount: Nat;
  frequency: Frequency;
  nextDepositTime: Nat64;
};

type UserConfig = {
    subaccount: [Nat8];
    recurring: ?{
      amount: Nat;
      frequency: Frequency;
      nextDepositTime: Nat64;
    };
    balance: Nat;
  };