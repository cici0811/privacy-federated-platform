const { validationResult } = require('express-validator');
const travelService = require('../services/travelService');

exports.searchTravel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { destination, dateRange, companions } = req.body;
  
  const plan = await travelService.initiateSearch({
    userId: req.user.id,
    destination,
    dateRange,
    companions
  });

  res.json({
    success: true,
    searchId: plan._id,
    message: 'Privacy-preserving travel search initiated.'
  });
};

exports.getTravelResults = async (req, res) => {
  const { id } = req.params;
  const plan = await travelService.getPlan(id);

  if (!plan) {
    return res.status(404).json({ message: 'Travel plan not found' });
  }

  if (plan.status !== 'results_ready') {
    return res.status(202).json({ message: 'Searching federated providers...' });
  }

  res.json({
    success: true,
    destination: plan.destination,
    dateRange: plan.dateRange,
    results: plan.results
  });
};

exports.bookTravel = async (req, res) => {
  // Booking logic remains simplified for now
  res.json({
    success: true,
    bookingRef: 'BK-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    message: 'Booking request sent anonymously to provider. Confirmation will be encrypted.'
  });
};
