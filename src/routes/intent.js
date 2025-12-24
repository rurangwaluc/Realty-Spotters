// routes/intent.js
router.post("/", async (req, res) => {
  console.log("UNLOCK INTENT:", req.body);
  res.json({ ok: true });
});
