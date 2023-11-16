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

app.post("/issuing-card", async (req, res) => {
  const card = await stripe.issuing.cards
    .retrieve(req.body.ISSUING_CARD_ID)
    .catch((error) => {
      console.log(error);
      return null;
    });
  res.json(card);
});

app.post("/create-ephemeral-key", async (req, res) => {
  let key = await stripe.ephemeralKeys
    .create(
      { issuing_card: req.body.ISSUING_CARD_ID },
      { apiVersion: req.body.API_VERSION },
    )
    .catch((error) => {
      console.log(error);
      return null;
    });
  res.json(key);
});
app.post("/create-card/:carlHolderId", async (req, res) => {
  const card = await stripe.issuing.cards
    .create({
      cardholder: req.params.carlHolderId,
      currency: "usd",
      type: "virtual",
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
  res.json(card);
});
app.post("/create-card-holder", async (req, res) => {
  const cardholder = await stripe.issuing.cardholders
    .create({
      name: "Jenny Rosen",
      email: "jenny.rosen@example.com",
      phone_number: "+18008675309",
      status: "active",
      type: "individual",
      individual: {
        first_name: "Jenny",
        last_name: "Rosen",
        dob: { day: 1, month: 11, year: 1981 },
      },
      billing: {
        address: {
          line1: "123 Main Street",
          city: "San Francisco",
          state: "CA",
          postal_code: "94111",
          country: "US",
        },
      },
    })
    .catch((error) => {
      console.log(error);

      return null;
    });

  res.json(cardholder);
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
//ich_1ODAaXAKKjIUPD3INXxCnCrL
