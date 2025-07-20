import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
// import Actor "mo:base/Actor";
import Types "types";
import Helpers "utils/helpers";
import ICRC1 "./icrc1";

actor InvestmentApp {
  stable var usernames: Trie.Trie<Text, Text> = Trie.empty();
  stable var users: Trie.Trie<Text, Types.User> = Trie.empty();
  stable var vaultUsers: Trie.Trie<Principal, Types.UserConfig> = Trie.empty();

  private var timers: Trie.Trie<Text, Nat> = Trie.empty();

  private func get_user_by_id(principal_id: Text) : ?Types.User {
    switch (Trie.get(users, Helpers.key(principal_id), Text.equal)) {
        case (?user) return ?user;
        case (_) return null;
    }
  };

  func is_username_exists(username: Text): Bool {
    switch (Trie.get(usernames, Helpers.key(username), Text.equal)) {
        case (?username) return true;
        case (_) return false;
    }
  };

  public query ({ caller }) func get_user() : async ?Types.User {
    let authenticated = Helpers.is_authenticated(caller);

    if (authenticated == false) return null;

    let principal_id = Principal.toText(caller);

    switch (Trie.get(users, Helpers.key(principal_id), Text.equal)) {
        case (?user) return ?{ principal_id = user.principal_id; username = user.username };
        case (_) return null;
    }
  };

  private func make_subaccount(principal: Principal, acc_id: Nat) : Blob {
    var subaccount = Array.init<Nat8>(32, 0);
    subaccount[0] := Nat8.fromNat(acc_id);

    let userBytesArray = Blob.toArray(Principal.toBlob(principal));
    for (i in userBytesArray.keys()) {
      if (i + 1 < 32) {
        subaccount[i + 1] := userBytesArray[i];
      }
    };

    return Blob.fromArrayMut(subaccount);
  };

  public shared ({caller}) func register_user(username: Text) : async Types.User {
    var authenticated = Helpers.is_authenticated(caller);

    if (not authenticated) {
      throw Error.reject("Only authenticated users can register");
    };

    var is_valid_username = Helpers.validate_username(username);

    if (not is_valid_username) {
      throw Error.reject("Username is not valid. It should contain only alphanumeric symbols and have maximus size of 10 symbols");
    };

    var username_exists = is_username_exists(username);
    
    if (username_exists) {
      throw Error.reject("Username should be unique. And the username you've provided already exists");
    };

    let principal_id = Principal.toText(caller);
    let user_key : Trie.Key<Text> = Helpers.key(principal_id);

    let subaccount = make_subaccount(caller, 0);

    let account_address = Helpers.convert_buffer_to_hex(Blob.toArray(Principal.toLedgerAccount(caller, ?subaccount)));

    let wallet_config : Types.WalletConfig = {
      subaccount = subaccount;
      account_address = account_address;
      recurring = null;
      balance = 0;
    };

    let new_user: Types.User = {
      principal_id = principal_id;
      username = username;
      wallets_configs = [wallet_config];
    };

    usernames := Trie.put(usernames, Helpers.key(username), Text.equal, username).0;
    users := Trie.put(users, user_key, Text.equal, new_user).0;

    return new_user;
  };

  let ckbtcCanisterId : Principal = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
  let icrc1 : ICRC1.ICRC1 = actor(Principal.toText(ckbtcCanisterId));

  let ckbtcCanister = actor("rrkah-fqaaa-aaaaa-aaaaq-cai") : actor {
    icrc2_transfer_from : shared ICRC1.TransferArgs -> async ICRC1.Result;
    icrc1_balance_of : shared query ICRC1.Account -> async ICRC1.Token;
  };

  public shared ({ caller }) func deposit_to_vault_account(
    amount: Nat
  ) : async ICRC1.Result<Nat, Text> {
    let principal_id = Principal.toText(caller);

    switch (get_user_by_id(principal_id)) {
      case (null) {
        return #err("User not registered");
      };
      case (?user) {
        let to_subaccount = user.wallets_configs[0].subaccount;

        let transfer_args: ICRC1.TransferArgs = {
          from_subaccount = null;
          to = {
            owner = Principal.fromActor(this);
            subaccount = ?to_subaccount;
          };

          amount = amount;
          fee = ?5;
          memo = null;
          created_at_time = ?Time.now();
          expires_at = null;
        };

        try {
          let result = await ckbtcCanister.icrc2_transfer_from(transfer_args);
          switch (result) {
            case (#ok(block_index)) return #ok(block_index);
            case (#err(transfer_error)) return #err("Transfer failed: " # debug_show(transfer_error));
          };
        } catch (e) {
          return #err("Caught error: " # Error.message(e));
        };
      };
    };
  };

  public shared ({ caller }) func get_wallet_balance(wallet: ?Blob) : async Nat64 {
    let owner_rec = {
      owner = caller;
      subaccount = wallet;
    };
    let balance = await ckbtcCanister.icrc1_balance_of(owner_rec);
    return Nat64.fromNat(balance);
  };

  public shared ({ caller }) func create_recurrent_deposit(
    amount: Nat,
    frequency: Types.Frequency,
  ) : async Result.Result<Nat, Text> {
    let principal_id = Principal.toText(caller);

    switch (get_user_by_id(principal_id)) {
      case (null) return #err("User not registered");
      case (?user) {

        let subaccount = user.wallets_configs[0].subaccount;

        let now = Time.now();

        let recurring = {
          amount = amount;
          frequency = frequency;
          next_deposit_time = now;
        };

        update_user_recurring(principal_id, subaccount, recurring);

        func pay(last_deposit_time: Time.Time) : async () {
          let transfer_result = await deposit_to_vault_account(amount);

          switch (transfer_result) {
            case (#ok(_)) {
              let next_time = switch (frequency) {
                case (#daily) Time.addSeconds(last_deposit_time, 86400);
                case (#weekly) Time.addSeconds(last_deposit_time, 604800);
                case (#monthly) Time.addDays(last_deposit_time, 30);
                case (#quarterly) Time.addDays(last_deposit_time, 90);
              };

              update_next_deposit_time(principal_id, subaccount, next_time);

              let delay_in_seconds = Time.diff(next_time, Time.now());
              let delay_in_nanos = if (delay_in_seconds > 0) {
                delay_in_seconds * 1_000_000_000;
              } else {
                1_000_000_000;
              };

              let timer_id = Timer.setTimer(#nanoseconds delay_in_nanos, func () {
                pay(next_time);
              });

              timers := Trie.put<Text, Nat>(timers, Helpers.key(principal_id), Nat.equal, timer_id).0;
            };
            case (#err(e)) {
              Debug.print("Payment failed: " # e);
            };
          };
        };

        let first_timer_id = Timer.setTimer(#nanoseconds 0, func () {
          pay(now);
        });

        timers := Trie.put<Text, Nat>(timers, Helpers.key(principal_id), Nat.equal, first_timer_id).0;

        return #ok(1);
      };
    };
  };


  public shared ({ caller }) func withdraw_from_vault(
    from_subaccount: Blob,
    amount: Nat
  ) : async Result.Result<Icrc1Ledger.BlockIndex, Text> {

    let principal_id = Principal.toText(caller);

    switch (get_user_by_id(principal_id)) {
      case (null) {
        return #err("User not registered");
      };
      case (?user) {
        let target_wallet = Array.find<Types.WalletConfig>(user.wallets_configs, func (w) {
          w.subaccount == from_subaccount
        });

        switch (target_wallet) {
          case (null) {
            return #err("Wallet with given subaccount not found");
          };
          case (?wallet) {
            switch (Trie.get(timers, Trie.key(principal_id), Nat.equal)) {
              case (?timer_id) {
                Timer.cancelTimer(timer_id);
                timers := Trie.remove<Text, Nat>(timers, Trie.key(principal_id)).0;
              };
              case (null) {};
            };

            let updated_wallet : Types.WalletConfig = {
              subaccount = wallet.subaccount;
              account_address = wallet.account_address;
              recurring = null;
              balance = wallet.balance;
            };

            update_user_wallet_config(principal_id, updated_wallet);

            let transfer_args: ICRC1.TransferArgs = {
              from_subaccount = ?from_subaccount;
              to = {
                owner = caller;
                subaccount = null;
              };
              amount = amount;
              fee = ?5;
              memo = null;
              created_at_time = ?Time.now();
              expires_at = null;
            };

            try {
              let result = await ckbtcCanister.icrc2_transfer_from(transfer_args);
              switch (result) {
                case (#ok(block_index)) return #ok(block_index);
                case (#err(transfer_error)) return #err("Transfer failed: " # debug_show(transfer_error));
              };
            } catch (e) {
              return #err("Unexpected error during transfer: " # Error.message(e));
            };
          };
        };
      };
    };
  };

  //Functions for development and debug
  public query func get_all_users() : async Trie.Trie<Text, Types.User> {
    users;
  };

  public query func get_all_usernames() : async Trie.Trie<Text, Text> {
    usernames;
  };

  public shared func clear_data() : async Bool {
    users := Trie.empty();
    usernames := Trie.empty();

    return true;
  }
};
