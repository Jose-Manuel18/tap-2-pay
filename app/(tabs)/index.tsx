import { Alert, StyleSheet } from "react-native";

import {
  AddToWalletButton,
  Constants,
  GooglePayCardToken,
  PlatformPay,
  canAddCardToWallet,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
} from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import Stripe from "stripe";
// import AddToGooglePayPNG from "../../assets/images/en_badge_web_generic.png";
import { View } from "../../components/Themed";

const API_URL = "http://192.168.0.126:3000";
const ISSUING_CARD_ID = "ic_1ODAgtAKKjIUPD3IARaWQcnM";

type CustomString = string | null;
export default function TabOneScreen() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [key, setKey] = useState({});
  const [card, setCard] = useState<Stripe.Issuing.Card>();
  const [showAddToWalletButton, setShowAddToWalletButton] = useState(false);
  const [androidCardToken, setAndroidCardToken] =
    useState<null | GooglePayCardToken>(null);

  useEffect(() => {
    fetchEphemeralKey();
    fetchIssuingCard();
  }, []);
  const checkIfCanAddCard = async (card: Stripe.Issuing.Card) => {
    const { canAddCard, details, error } = await canAddCardToWallet({
      primaryAccountIdentifier: card?.wallets
        ?.primary_account_identifier as CustomString,
      cardLastFour: card?.last4 as string,
    });

    if (error) {
      Alert.alert(error.code, error.message);
    } else {
      setShowAddToWalletButton(canAddCard);
      if (
        details?.token?.status === "TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION"
      ) {
        setAndroidCardToken(details.token);
      }
    }
  };
  // const canAddCard = async () => {
  //   // See above
  // };

  const fetchIssuingCard = async () => {
    console.log("fetchIssuingCard");
    const response = await fetch(`${API_URL}/issuing-card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ISSUING_CARD_ID,
      }),
    });
    console.log("response", response);
    const card = await response.json();
    console.log("card", card);
    await checkIfCanAddCard(card);

    if (!card.wallets.apple_pay.eligible) {
      console.log("apple_pay.eligible");
      // Do not show <AddToWalletButton /> component on iOS. See card.wallets.apple_pay.ineligible_reason for details
    } else if (!card.wallets.google_pay.eligible) {
      console.log("google_pay.eligible");
      // Do not show <AddToWalletButton /> component on Android. See card.wallets.google_pay.ineligible_reason for details
    } else {
      setCard(card);
    }
  };

  const fetchEphemeralKey = async () => {
    const response = await fetch(`${API_URL}/ephemeral-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ISSUING_CARD_ID,
        API_VERSION: Constants.API_VERSIONS.ISSUING,
      }),
    });
    const myKey = await response.json();
    setKey(myKey);
  };

  const [loading, setLoading] = useState(false);

  const Setup = async () => {
    if (!(await isPlatformPaySupported())) {
      Alert.alert("Error", "Platform Pay is not supported on this device");
      return;
    }

    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currency: "usd" }),
    });
    const result = await response.json();

    setClientSecret(result.paymentIntent);
    setLoading(true);
  };

  const buy = async () => {
    setLoading(false);
    const { error } = await confirmPlatformPayPayment(clientSecret, {
      googlePay: {
        currencyCode: "USD",
        merchantCountryCode: "US",
        merchantName: "Example Merchant",
        testEnv: true,
        isEmailRequired: false,
      },
      applePay: {
        cartItems: [
          {
            label: "test",
            amount: "1.00",
            paymentType: PlatformPay.PaymentType.Immediate,
          },
        ],
        currencyCode: "USD",
        merchantCountryCode: "US",
      },
    });
    if (error) {
      setLoading(true);
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setLoading(false);
      Alert.alert("Success", "Your order is confirmed!");
    }
  };
  const createCardHolder = async () => {
    const response = await fetch(`${API_URL}/create-card/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    console.log(result);
  };

  return (
    // <View style={styles.container}>
    //   <PlatformPayButton
    //     style={styles.payButton}
    //     onPress={buy}
    //     disabled={!loading}
    //     type={PlatformPay.ButtonType.Pay}
    //   />
    //   <Button title="Card Holder" onPress={createCardHolder} />
    // </View>
    <View>
      {showAddToWalletButton && (
        <AddToWalletButton
          token={androidCardToken}
          androidAssetSource={require("../../assets/images/en_badge_web_generic.png")}
          testEnv={true}
          style={styles.payButton}
          iOSButtonStyle="onLightBackground"
          cardDetails={{
            name: card?.cardholder?.name as string,
            primaryAccountIdentifier: card?.wallets
              ?.primary_account_identifier as CustomString, // This can be null, but should still always be passed. Failing to pass the primaryAccountIdentifier can result in a failure to provision the card.
            lastFour: card?.last4,
            description: "Added by Stripe",
          }}
          ephemeralKey={key}
          onComplete={({ error }) => {
            Alert.alert(
              error ? error.code : "Success",
              error
                ? error.message
                : "Card was successfully added to the wallet.",
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  card: { backgroundColor: "#ccc" },
  cardContainer: {
    height: 50,
    marginVertical: 30,
    width: "80%",
  },

  payButton: {
    width: "50%",
    height: 50,
    marginTop: 60,
    alignSelf: "center",
  },
});
