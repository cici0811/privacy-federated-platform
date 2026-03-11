const db = require('../models/db');

exports.getConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = await db.users.findOne({ _id: userId }, { config: 1 });
    
    // Default config if not set
    if (!user || !user.config) {
      const defaultConfig = {
        modelName: 'Llama-3-8B-Quantized',
        privacyLevel: 'enhanced', // basic, enhanced, extreme
        maxBudget: 10.0,
        useNPU: true
      };
      
      // Save default
      await db.users.update({ _id: userId }, { $set: { config: defaultConfig } });
      return res.json({ success: true, config: defaultConfig });
    }
    
    res.json({ success: true, config: user.config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    const newConfig = req.body;
    
    // Validate config (basic)
    if (newConfig.maxBudget < 0) return res.status(400).json({ success: false, message: 'Budget cannot be negative' });

    await db.users.update(
      { _id: userId },
      { $set: { config: newConfig, updatedAt: new Date() } }
    );
    
    // Log audit event
    await db.logs.insert({
      type: 'config_update',
      userId: userId,
      timestamp: new Date(),
      details: `Privacy Level set to ${newConfig.privacyLevel}`
    });

    res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
