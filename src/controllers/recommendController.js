import Neighborhood from "../models/Neighborhood.js";
import SearchLog from "../models/SearchLog.js";
import PaymentIntent from "../models/PaymentIntent.js";



const getConfidence = (score) => {
  if (score >= 85) return "High";
  if (score >= 70) return "Medium";
  return "Low";
};

export const recommendNeighborhoods = async (req, res) => {
  try {
    const { budget, bedrooms, priority } = req.body;

    // 1️⃣ Validation
    if (
      typeof budget !== "number" ||
      typeof bedrooms !== "number" ||
      !["quiet", "family", "nightlife", "commute"].includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid input. Check budget, bedrooms, and priority.",
      });
    }

    const neighborhoods = await Neighborhood.find();

    // console.log("NEIGHBORHOODS FOUND:", neighborhoods.length);


    const scored = neighborhoods.map((n) => {
      let score = 0;
      const reasons = [];

      // Budget fit
      if (budget >= n.rentRange.min && budget <= n.rentRange.max) {
        score += 40;
        reasons.push("Fits within your budget range");
      } else if (budget >= n.rentRange.min * 0.9) {
        score += 25;
        reasons.push("Slightly above your budget but still realistic");
      }

      // Lifestyle
      if (n.lifestyleScores[priority]) {
        score += n.lifestyleScores[priority] * 3;
        reasons.push(`Highly suitable for a ${priority} lifestyle`);
      }

      // Bedrooms
      if (n.typicalBedrooms.includes(bedrooms)) {
        score += 20;
        reasons.push(`Commonly available with ${bedrooms} bedrooms`);
      }

      // Base desirability
      score += 10;
      reasons.push("Generally desirable residential area");

      return {
        neighborhood: {
          name: n.name,
          city: n.city,
          rentRange: n.rentRange,
        },
        score,
        confidence: getConfidence(score),
        reasons,
      };
    });

  const sortedResults = scored.sort((a, b) => b.score - a.score);


      const FREE_LIMIT = 1;

    const searchLog = await SearchLog.create({
      budget,
      bedrooms,
      priority,
      resultsCount: sortedResults.length,
    });

      res.json({
        searchLogId: searchLog._id,
        meta: {
          input: { budget, bedrooms, priority },
          totalResults: sortedResults.length,
          freeLimit: FREE_LIMIT,
        },
        free: sortedResults.slice(0, FREE_LIMIT),
        locked: sortedResults.slice(FREE_LIMIT),
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const unlockRecommendations = async (req, res) => {
  try {
    const { reference, budget, bedrooms, priority } = req.body;

    if (!reference) {
      return res.status(400).json({ message: "Missing payment reference" });
    }

    // 1️⃣ Verify payment
    const payment = await PaymentIntent.findOne({ reference });

    if (!payment || payment.status !== "paid") {
      return res.status(403).json({
        message: "Payment not completed",
      });
    }

    // 2️⃣ Recompute recommendations (MVP-safe)
    const neighborhoods = await Neighborhood.find();

    const scored = neighborhoods.map((n) => {
      let score = 0;
      const reasons = [];

      if (budget >= n.rentRange.min && budget <= n.rentRange.max) {
        score += 40;
        reasons.push("Fits within your budget range");
      } else if (budget >= n.rentRange.min * 0.9) {
        score += 25;
        reasons.push("Slightly above your budget but still realistic");
      }

      if (n.lifestyleScores[priority]) {
        score += n.lifestyleScores[priority] * 3;
        reasons.push(`Highly suitable for a ${priority} lifestyle`);
      }

      if (n.typicalBedrooms.includes(bedrooms)) {
        score += 20;
        reasons.push(`Commonly available with ${bedrooms} bedrooms`);
      }

      score += 10;
      reasons.push("Generally desirable residential area");

      return {
        neighborhood: {
          name: n.name,
          city: n.city,
          rentRange: n.rentRange,
        },
        score,
        confidence: getConfidence(score),
        reasons,
      };
    });

    const sortedResults = scored.sort((a, b) => b.score - a.score);

    res.json({
      unlocked: true,
      results: sortedResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

