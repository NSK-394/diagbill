const Bill = require('../models/Bill');
const Clinic = require('../models/Clinic');
const Test = require('../models/Test');

exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalBills,
      totalClinics,
      totalTests,
      thisMonthRevenue,
      lastMonthRevenue,
      recentBills,
      monthlyRevenue,
    ] = await Promise.all([
      Bill.countDocuments(),
      Clinic.countDocuments({ isActive: true }),
      Test.countDocuments({ isActive: true }),
      Bill.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Bill.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Bill.find()
        .populate('clinicId', 'name color')
        .sort({ createdAt: -1 })
        .limit(8),
      Bill.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    const totalRevenue = await Bill.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = monthlyRevenue.map((m) => ({
      month: months[m._id.month - 1],
      revenue: Math.round(m.revenue),
      count: m.count,
    }));

    const thisMonth = thisMonthRevenue[0] || { total: 0, count: 0 };
    const lastMonth = lastMonthRevenue[0] || { total: 0 };
    const revenueGrowth = lastMonth.total > 0
      ? (((thisMonth.total - lastMonth.total) / lastMonth.total) * 100).toFixed(1)
      : 100;

    res.json({
      totalBills,
      totalRevenue: Math.round(totalRevenue[0]?.total || 0),
      totalClinics,
      totalTests,
      thisMonthRevenue: Math.round(thisMonth.total),
      thisMonthBills: thisMonth.count,
      revenueGrowth: parseFloat(revenueGrowth),
      revenueByMonth,
      recentBills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
