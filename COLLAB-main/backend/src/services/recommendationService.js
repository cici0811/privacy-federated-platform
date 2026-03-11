const db = require('../models/db');

class RecommendationService {
  async getRecommendations(userId) {
    // In a real FL system, this would pull from the local model's inference
    // For now, we return mock recommendations but stored in DB to simulate persistence
    let recs = await db.recommendations.find({ userId });
    
    if (recs.length === 0) {
      // Seed default recommendations
      const defaults = [
        {
          userId,
          title: "阿里云无影云电脑企业版",
          type: "SaaS Tools",
          reason: "基于您团队最近的远程开发需求模式",
          match: 94,
          tag: "生产力"
        },
        {
          userId,
          title: "莫干山裸心谷团建方案",
          type: "Team Building",
          reason: "匹配团队Q4高强度工作后的放松偏好",
          match: 89,
          tag: "生活服务"
        },
        {
          userId,
          title: "JetBrains IDE 团队订阅优惠",
          type: "Development",
          reason: "研发中心共性采购需求聚合",
          match: 85,
          tag: "开发工具"
        }
      ];
      await db.recommendations.insert(defaults);
      recs = defaults;
    }
    
    return recs;
  }
}

module.exports = new RecommendationService();
