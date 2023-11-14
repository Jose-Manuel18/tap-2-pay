import { Alert, Button, StyleSheet, TextInput } from "react-native";

import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import { Details } from "@stripe/stripe-react-native/lib/typescript/src/types/components/CardFieldInput";
import { useState } from "react";
import { View } from "../../components/Themed";
const API_URL = "http://192.168.0.126:3000";
export default function TabOneScreen() {
  const [email, setEmail] = useState<string>("");
  const [cardDetails, setCardDetails] = useState<Details | null>(null);
  const { confirmPayment, loading } = useConfirmPayment();

  const fetchPaymentIntentClientSecret = async () => {
    const response = await fetch(`${API_URL}/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    const { clientSecret, error } = await response.json();
    return { clientSecret, error };
  };

  const handlePayPress = async () => {
    if (!cardDetails?.complete || !email) {
      Alert.alert("Error", "Please enter complete Card and email information");
      return;
    }
    const billingDetails = {
      email: email,
    };

    try {
      const { clientSecret, error } = await fetchPaymentIntentClientSecret();
      if (error) {
        Alert.alert("Error", error);
        return;
      } else {
        const { paymentIntent, error } = await confirmPayment(clientSecret, {
          paymentMethodType: "Card",
          paymentMethodData: { billingDetails: billingDetails },
        });
        if (error) {
          Alert.alert("Error", error.message);
        } else if (paymentIntent) {
          Alert.alert("Success", paymentIntent.status);
          console.log("Success", paymentIntent);
        }
      }
    } catch (error) {
      console.log("maybe here ", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
        placeholder="Email"
        placeholderTextColor="gray"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={(value) => {
          setEmail(value);
        }}
      />
      <CardField
        cardStyle={styles.card}
        style={styles.cardContainer}
        postalCodeEnabled={true}
        placeholders={{
          number: "4242 4242 4242 4242",
        }}
        onCardChange={(cardDetails) => {
          setCardDetails(cardDetails);
        }}
      />

      <Button title="Pay" onPress={handlePayPress} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "burlywood",
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
});
