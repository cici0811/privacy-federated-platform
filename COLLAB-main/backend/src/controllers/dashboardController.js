const db = require('../models/db');

exports.getStats = async (req, res) => {
  try {
    const totalNodes = await db.nodes.count({});
    const activeNodes = await db.nodes.count({ status: 'online' });
    const totalLogs = await db.logs.count({});
    const criticalEvents = await db.logs.count({ level: 'critical' });

    res.json({
      success: true,
      stats: {
        totalNodes,
        activeNodes,
        totalLogs,
        criticalEvents,
        privacyScore: 94.5 // Simulated for now
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await db.logs.find({}).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
