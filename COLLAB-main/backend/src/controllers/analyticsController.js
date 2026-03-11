const db = require('../models/db');

exports.getRiskAnalysis = async (req, res) => {
  try {
    // In a real system, this would analyze recent transactions and model gradients
    // Here we simulate based on recent log activity
    
    const recentCriticalLogs = await db.logs.count({ 
      level: 'critical', 
      timestamp: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });
    
    const riskScore = Math.min(100, recentCriticalLogs * 5 + 10); // Base risk 10
    const entropy = 0.92 + (Math.random() * 0.05); // Simulated high entropy (good)
    
    const history = Array.from({ length: 7 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      risk: Math.floor(Math.random() * 20) + 10
    }));
    
    res.json({
      success: true,
      analysis: {
        currentRiskScore: riskScore,
        entropy: entropy,
        status: riskScore > 50 ? 'High Risk' : 'Safe',
        history: history
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
