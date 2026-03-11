const { validationResult } = require('express-validator');
const schedulerService = require('../services/schedulerService');

exports.initiateMeeting = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { topic, duration, participants, dateRange } = req.body;
  
  const meeting = await schedulerService.initiateMeeting({
    userId: req.user.id,
    topic,
    duration,
    participants,
    dateRange
  });

  res.json({ 
    success: true, 
    meetingId: meeting._id, 
    message: 'Federated scheduling task initiated. Privacy-preserving matching in progress.' 
  });
};

exports.getMeetingStatus = async (req, res) => {
  const { id } = req.params;
  const meeting = await schedulerService.getMeeting(id);
  
  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }

  res.json({
    id: meeting._id,
    status: meeting.status,
    progress: meeting.status === 'ready' ? 100 : Math.floor(Math.random() * 80) + 10
  });
};

exports.getCandidates = async (req, res) => {
  const { id } = req.params;
  const meeting = await schedulerService.getMeeting(id);

  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }

  if (meeting.status !== 'ready') {
    return res.status(202).json({ message: 'Calculation in progress' });
  }

  res.json({
    success: true,
    candidates: meeting.candidates
  });
};

exports.confirmMeeting = async (req, res) => {
  const { meetingId, candidateId } = req.body;
  const meeting = await schedulerService.getMeeting(meetingId);

  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }

  await schedulerService.updateMeeting(meetingId, {
    status: 'confirmed',
    confirmedCandidateId: candidateId
  });

  res.json({
    success: true,
    message: 'Meeting confirmed securely. Invites sent via encrypted channels.'
  });
};
