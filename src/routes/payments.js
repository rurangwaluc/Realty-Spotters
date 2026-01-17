import { confirmPayment, confirmPaymentSandbox, esiciaWebhook, initiatePayment } from "../controllers/paymentController.js";

import express from "express";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/confirm", confirmPayment);
router.post("/confirm-sandbox", confirmPaymentSandbox);
router.post("/esicia/webhook", esiciaWebhook);


export default router;
