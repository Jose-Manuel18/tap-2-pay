//create simple server with express
import bodyParser from "body-parser";
import express from "express";
import Stripe from "stripe";
const stripe = new Stripe(
  "sk_test_51MlKm2AKKjIUPD3IxBr10wAEprT8FZrJEIcLtrOs5s2PoSqvCvqQs3WDJMusiB31QTRVWFNWYK76ogj8OgvCB6o000cwLp60b6",
  { apiVersion: "2023-10-16", typescript: true },
);
const port = 3000;
const app = express();
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/payment-sheet", async (req, res) => {
  const {
    email = "jmmg185@gmail.com",
    currency = "usd",
    request_three_d_secure,
    payment_method_types = [],
  } = req.body;
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2023-10-16" },
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency,
    customer: customer.id,
    payment_method_types: payment_method_types,
    payment_method_options: {
      card: {
        request_three_d_secure: request_three_d_secure || "automatic",
      },
    },
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey:
      "pk_test_51MlKm2AKKjIUPD3I4yQOkYJyiseTqBBviG3qS7m5TCDxFXP3TxePNlf3t4Cy2ikIfzBQEjteMfb07LFkyHOikxGy006SWJ3mKM",
  });
});
