import axios from "axios";

const ESICIA_BASE_URL =
  process.env.ESICIA_ENV === "live"
    ? "https://pay.esicia.rw"
    : "https://pay.esicia.com";

export async function initiateEsiciaPayment(payload) {
  const response = await axios.post(
    ESICIA_BASE_URL,
    payload,
    {
      auth: {
        username: process.env.ESICIA_USERNAME,
        password: process.env.ESICIA_PASSWORD,
      },
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
