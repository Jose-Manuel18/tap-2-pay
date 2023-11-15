import { Alert, StyleSheet } from "react-native";

import {
  PlatformPay,
  PlatformPayButton,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
} from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import { View } from "../../components/Themed";
const API_URL = "http://192.168.0.126:3000";
export default function TabOneScreen() {
  const [clientSecret, setClientSecret] = useState<string>("");
  // const [email, setEmail] = useState<string>("");
  // const [cardDetails, setCardDetails] = useState<Details | null>(null);
  // const { confirmPayment, loading } = useConfirmPayment();

  // const fetchPaymentIntentClientSecret = async () => {
  //   const response = await fetch(`${API_URL}/create-payment-intent`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ email: email }),
  //   });

  //   const { clientSecret, error } = await response.json();
  //   return { clientSecret, error };
  // };

  // const handlePayPress = async () => {
  //   if (!cardDetails?.complete || !email) {
  //     Alert.alert("Error", "Please enter complete Card and email information");
  //     return;
  //   }
  //   const billingDetails = {
  //     email: email,
  //   };

  //   try {
  //     const { clientSecret, error } = await fetchPaymentIntentClientSecret();
  //     if (error) {
  //       Alert.alert("Error", error);
  //       return;
  //     } else {
  //       const { paymentIntent, error } = await confirmPayment(clientSecret, {
  //         paymentMethodType: "Card",
  //         paymentMethodData: { billingDetails: billingDetails },
  //       });
  //       if (error) {
  //         Alert.alert("Error", error.message);
  //       } else if (paymentIntent) {
  //         Alert.alert("Success", paymentIntent.status);
  //         console.log("Success", paymentIntent);
  //       }
  //     }
  //   } catch (error) {
  //     console.log("maybe here ", (error as Error).message);
  //   }
  // };
  // const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  // const fetchPaymentSheetParams = async () => {};

  // const initializePaymentSheet = async () => {
  //   try {
  //     const { paymentIntent, ephemeralKey, customer, publishableKey } =
  //       await fetchPaymentSheetParams();

  //     const { error } = await initPaymentSheet({
  //       merchantDisplayName: "Example, Inc.",
  //       customerId: customer,
  //       customerEphemeralKeySecret: ephemeralKey,
  //       paymentIntentClientSecret: paymentIntent,
  //       applePay: {
  //         merchantCountryCode: "US",
  //       },
  //       allowsDelayedPaymentMethods: true,
  //       defaultBillingDetails: {
  //         name: "Jane Doe",
  //       },
  //     });

  //     if (!error) {
  //       setLoading(true);
  //     }
  //   } catch (error) {
  //     console.error("Error initializing payment sheet:", error);
  //   }
  // };

  // const openPaymentSheet = async () => {
  //   const { error } = await presentPaymentSheet();

  //   if (error) {
  //     Alert.alert(`Error code: ${error.code}`, error.message);
  //   } else {
  //     Alert.alert("Success", "Your order is confirmed!");
  //   }
  // };

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

  useEffect(() => {
    Setup();
  }, []);

  return (
    <View style={styles.container}>
      <PlatformPayButton
        style={styles.payButton}
        onPress={buy}
        disabled={!loading}
      />
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
    width: 200,
    height: 50,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
