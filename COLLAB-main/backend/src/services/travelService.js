const db = require('../models/db');

class TravelService {
  async initiateSearch(data) {
    const plan = {
      ...data,
      status: 'searching',
      results: [],
      createdAt: new Date()
    };
    const newDoc = await db.travelPlans.insert(plan);

    // Log travel search
    await db.logs.insert({
      type: 'travel_search',
      level: 'info',
      event: `跨域行程搜索: ${data.destination}`,
      nodeId: data.userId || '用户',
      timestamp: new Date(),
      hash: 'trv-' + Math.random().toString(36).substr(2, 8)
    });

    // Simulate Async Search
    this.simulateSearch(newDoc._id, data.companions.length);

    return newDoc;
  }

  async getPlan(id) {
    return await db.travelPlans.findOne({ _id: id });
  }

  simulateSearch(planId, companionCount) {
    setTimeout(async () => {
      const results = this.generateTravelResults(companionCount);
      await db.travelPlans.update(
        { _id: planId },
        { $set: { status: 'results_ready', results: results } }
      );
    }, 1500);
  }

  generateTravelResults(companionCount) {
    const count = companionCount || 1;
    return [
      {
        id: 'opt1',
        type: 'train',
        provider: 'China Railway',
        transport: `G34 高铁 (商务座)`,
        transportTime: `09:00 - 13:28`,
        hotel: `亚朵S酒店 (市中心店)`,
        hotelDetails: `${Math.ceil(count / 2)}间大床房 • 含早`,
        price: 2480 * Math.ceil(count / 2),
        tags: ['性价比推荐']
      },
      {
        id: 'opt2',
        type: 'plane',
        provider: 'Air China',
        transport: `CA1705 国航`,
        transportTime: `08:30 - 10:45`,
        hotel: `全季酒店 (商务区店)`,
        hotelDetails: `${Math.ceil(count / 2)}间双床房 • 无早`,
        price: 3150 * Math.ceil(count / 2),
        tags: []
      },
      {
        id: 'opt3',
        type: 'plane',
        provider: 'Eastern Airlines',
        transport: `MU588 东方航空`,
        transportTime: `14:00 - 16:15`,
        hotel: `希尔顿逸林酒店`,
        hotelDetails: `${Math.ceil(count / 2)}间豪华房 • 含早`,
        price: 4200 * Math.ceil(count / 2),
        tags: ['豪华体验']
      }
    ];
  }
}

module.exports = new TravelService();
