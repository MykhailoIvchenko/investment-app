import Trie "mo:base/Trie";

type Key<K> = Trie.Key<K>;

type Frequency = {
  #daily;
  #weekly;
  #monthly;
  #quarterly;
};

type WalletConfig = {
  subaccount: Blob;
  account_address: Text;
  recurring: ?{
    amount: Nat;
    frequency: Frequency;
    next_deposit_time: Nat64;
  };
  balance: Nat;
};

type User = {
  principal_id: Text;
  username : Text;
  wallets_configs: [WalletConfig];
};
