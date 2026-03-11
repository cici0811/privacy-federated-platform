const db = require('../models/db');

class SchedulerService {
  async initiateMeeting(data) {
    const meeting = {
      ...data,
      status: 'calculating',
      candidates: [],
      createdAt: new Date()
    };
    const newDoc = await db.meetings.insert(meeting);
    
    // Log meeting initiation
    await db.logs.insert({
      type: 'meeting_initiated',
      level: 'info',
      event: `联邦日程任务: ${data.topic}`,
      nodeId: data.userId || '用户',
      timestamp: new Date(),
      hash: 'mtg-' + Math.random().toString(36).substr(2, 8)
    });

    // Simulate Async FL Calculation
    this.simulateCalculation(newDoc._id);
    
    return newDoc;
  }

  async getMeeting(id) {
    return await db.meetings.findOne({ _id: id });
  }

  async updateMeeting(id, updates) {
    await db.meetings.update({ _id: id }, { $set: updates });
    
    if (updates.status === 'confirmed') {
      await db.logs.insert({
        type: 'meeting_confirmed',
        level: 'success',
        event: `会议已确认: ${id}`,
        nodeId: '系统',
        timestamp: new Date(),
        hash: 'mtg-conf-' + Math.random().toString(36).substr(2, 8)
      });
    }

    return await this.getMeeting(id);
  }

  // Simulate FL Process
  simulateCalculation(meetingId) {
    setTimeout(async () => {
      const candidates = this.generateMockCandidates();
      await db.meetings.update(
        { _id: meetingId }, 
        { $set: { status: 'ready', candidates: candidates } }
      );
    }, 2000);
  }

  generateMockCandidates() {
    return [
      { 
        id: 'c1', 
        timeSlot: '10月25日 (周三) 14:00 - 15:30', 
        matchScore: 96, 
        conflictCount: 0, 
        encryptionHash: '0x8f...2a',
        participants: [
          { id: 'p1', status: 'accepted' },
          { id: 'p2', status: 'accepted' }
        ]
      },
      { 
        id: 'c2', 
        timeSlot: '10月26日 (周四) 10:00 - 11:30', 
        matchScore: 88, 
        conflictCount: 1, 
        encryptionHash: '0x1b...9c',
        participants: [
          { id: 'p1', status: 'accepted' },
          { id: 'p2', status: 'tentative' }
        ]
      },
      { 
        id: 'c3', 
        timeSlot: '10月27日 (周五) 15:00 - 16:30', 
        matchScore: 82, 
        conflictCount: 0, 
        encryptionHash: '0x4d...e1',
        participants: [
          { id: 'p1', status: 'tentative' },
          { id: 'p2', status: 'tentative' }
        ]
      }
    ];
  }
}

module.exports = new SchedulerService();
