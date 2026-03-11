const recommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendations = await recommendationService.getRecommendations(userId);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
