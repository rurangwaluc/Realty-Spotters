import axios from "axios";

/**
 * Get OAuth token from MTN MoMo Sandbox
 */
export const getMomoToken = async () => {
  const url = `${process.env.MTN_MOMO_BASE_URL}/collection/token/`;

  const response = await axios.post(
    url,
    null,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_COLLECTIONS_KEY,
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`
          ).toString("base64"),
      },
    }
  );

  return response.data.access_token;
};

/**
 * Request payment from user (Sandbox)
 */
export const requestMomoPayment = async ({
  reference,
  amount,
  phoneNumber,
}) => {
  const token = await getMomoToken();

  const url = `${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`;

  await axios.post(
    url,
    {
      amount: amount.toString(),
      currency: "RWF",
      externalId: reference,
      payer: {
        partyIdType: "MSISDN",
        partyId: phoneNumber,
      },
      payerMessage: "Neighborhood recommendations access",
      payeeNote: "Realty Spotters",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": reference,
        "X-Target-Environment": process.env.MTN_MOMO_ENV,
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_MOMO_COLLECTIONS_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return true;
};
