import SearchLog from "../models/SearchLog.js";
import PaymentIntent from "../models/PaymentIntent.js";

export const getAdminStats = async (req, res) => {
  try {
    // 1️⃣ Total searches
    const totalSearches = await SearchLog.countDocuments();

    // 2️⃣ Searches by priority
    const searchesByPriority = await SearchLog.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Budget distribution
    const budgetStats = await SearchLog.aggregate([
      {
        $group: {
          _id: null,
          avgBudget: { $avg: "$budget" },
          minBudget: { $min: "$budget" },
          maxBudget: { $max: "$budget" },
        },
      },
    ]);

    // 4️⃣ Payments
    const totalPayments = await PaymentIntent.countDocuments();
    const successfulPayments = await PaymentIntent.countDocuments({
      status: "paid",
    });

    const revenueAgg = await PaymentIntent.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // 5️⃣ Conversion rate
    const conversionRate =
      totalSearches === 0
        ? 0
        : ((successfulPayments / totalSearches) * 100).toFixed(2);

    res.json({
      searches: {
        total: totalSearches,
        byPriority: searchesByPriority,
        budgetStats: budgetStats[0] || {},
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        revenue: totalRevenue,
        conversionRate: `${conversionRate}%`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminStatsByDate = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // 1️⃣ Searches filtered by date
    const totalSearches = await SearchLog.countDocuments({
      createdAt: { $gte: sinceDate },
    });

    const searchesByPriority = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: sinceDate } } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const budgetStatsAgg = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: sinceDate } } },
      {
        $group: {
          _id: null,
          avgBudget: { $avg: "$budget" },
          minBudget: { $min: "$budget" },
          maxBudget: { $max: "$budget" },
        },
      },
    ]);

    // 2️⃣ Payments filtered by date
    const totalPayments = await PaymentIntent.countDocuments({
      createdAt: { $gte: sinceDate },
    });

    const successfulPayments = await PaymentIntent.countDocuments({
      status: "paid",
      createdAt: { $gte: sinceDate },
    });

    const revenueAgg = await PaymentIntent.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: { $gte: sinceDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const conversionRate =
      totalSearches === 0
        ? 0
        : ((successfulPayments / totalSearches) * 100).toFixed(2);

    res.json({
      range: `${days} days`,
      searches: {
        total: totalSearches,
        byPriority: searchesByPriority,
        budgetStats: budgetStatsAgg[0] || {},
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        revenue: totalRevenue,
        conversionRate: `${conversionRate}%`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
