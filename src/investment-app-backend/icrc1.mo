import Principal "mo:base/Principal";
import Blob "mo:base/Blob";

module {
  public type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  public type TransferArgs = {
    from_subaccount : ?Blob;
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?Blob;
    created_at_time : ?Nat;
    expires_at : ?Nat;
  };

  public type TransferError = {
    #InsufficientFunds;
    #BadFee : Nat;
    #TxTooOld : Nat;
    #TxCreatedInFuture : Nat;
    #Duplicate : Blob;
    #TemporarilyUnavailable;
    #GenericError : { message : Text; error_code : Nat };
  };

  public type Value = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : Blob;
    #Bool : Bool;
    #Principal : Principal;
    #Empty;
  };

  public type Result<Ok, Err> = {
    #ok : Ok;
    #err : Err;
  };

  public type Standard = {
    name : Text;
    url : Text;
  };

  public type ICRC1 = actor {
    icrc1_name : query () -> async Text;
    icrc1_symbol : query () -> async Text;
    icrc1_decimals : query () -> async Nat8;
    icrc1_fee : query () -> async Nat;
    icrc1_total_supply : query () -> async Nat;
    icrc1_minting_account : query () -> async ?Account;
    icrc1_balance_of : query (Account) -> async Nat;
    icrc1_transfer : (TransferArgs) -> async Result<Nat, TransferError>;
    icrc1_metadata : query () -> async [(Text, Value)];
    icrc1_supported_standards : query () -> async [Standard];
  };
}
