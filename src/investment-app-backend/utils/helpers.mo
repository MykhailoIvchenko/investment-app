import Types "../types";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Char "mo:base/Char";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";


func key(t: Text) : Types.Key<Text> { { hash = Text.hash t; key = t } };

func is_authenticated(caller: Principal) : Bool {
  return Principal.isAnonymous(caller) == false;
};

func validate_username(username: Text): Bool {
  if (Text.size(username) == 0 or Text.size(username) > 10) {
    return false;
  };

  var isValid = true;
  Iter.iterate<Char>(username.chars(), func(c, _) {
    if (not (Char.isAlphabetic(c) or Char.isDigit(c))) {
      isValid := false;
    };
  });

  return isValid;
};

func convert_nat4_to_text(n : Nat8) : Text {
  if (n < 10) {
    Char.toText(Char.fromNat32(Nat32.fromNat(48 + Nat8.toNat(n))))
  } else {
    Char.toText(Char.fromNat32(Nat32.fromNat(87 + Nat8.toNat(n))))
  }
};

func convert_nat8_to_text(byte : Nat8) : Text {
  let left_nat4 = byte >> 4;
  let right_nat4 = byte & 15;
  convert_nat4_to_text(left_nat4) # convert_nat4_to_text(right_nat4);
};

func convert_buffer_to_hex(buffer : [Nat8]) : Text {
  Text.join("", Iter.map(Iter.fromArray(buffer), convert_nat8_to_text));
};
