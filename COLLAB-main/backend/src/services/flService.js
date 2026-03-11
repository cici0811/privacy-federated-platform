const db = require('../models/db');

class FLService {
  constructor() {
    this.nodes = new Map(); // In-memory node status for real-time
    this.currentRound = 0;
    this.roundContributions = 0;
    this.isTraining = false;
    this.modelHash = 'init-hash-0000';
    this.accuracy = 0.75;
  }

  registerNode(socketId, metadata) {
    const node = {
      socketId,
      id: metadata.id || `node-${Math.random().toString(36).substr(2, 6)}`,
      status: 'online',
      joinedAt: new Date(),
      contribution: 0
    };
    this.nodes.set(socketId, node);
    
    // Persist node log
    db.nodes.insert({ ...node, event: 'connected' });
    
    return node;
  }

  unregisterNode(socketId) {
    if (this.nodes.has(socketId)) {
      const node = this.nodes.get(socketId);
      db.nodes.insert({ ...node, status: 'offline', event: 'disconnected', disconnectedAt: new Date() });
      this.nodes.delete(socketId);
    }
  }

  getNodes() {
    return Array.from(this.nodes.values());
  }

  async processGradient(socketId, gradientData) {
    // Simulate complex aggregation logic
    // In production, this would involve homomorphic encryption operations (CKKS)
    // and secure multiparty computation (MPC)
    
    const node = this.nodes.get(socketId);
    if (node) {
      node.contribution += 1;
      node.lastTraining = new Date();
      this.nodes.set(socketId, node);
    }

    // Log the training contribution
    await db.logs.insert({
      type: 'gradient_update',
      nodeId: node ? node.id : 'unknown',
      round: this.currentRound,
      hash: gradientData.hash,
      timestamp: new Date()
    });

    // Check if we have enough updates to advance round
    // Simple logic: require at least 3 updates or 50% of connected nodes (min 2)
    this.roundContributions++;
    const requiredUpdates = Math.max(2, Math.min(3, this.nodes.size));
    
    if (this.roundContributions >= requiredUpdates) {
      this.advanceRound();
      // Broadcast with additional training metrics for visualization
      return { 
        newRound: true, 
        round: this.currentRound, 
        hash: this.modelHash, 
        accuracy: this.accuracy,
        loss: Math.max(0.1, 1.0 - this.accuracy - (Math.random() * 0.05)) // Simulated loss
      };
    }

    return { newRound: false };
  }

  advanceRound() {
    this.currentRound++;
    this.roundContributions = 0;
    this.modelHash = `round-${this.currentRound}-${Math.random().toString(36).substr(2, 8)}`;
    this.accuracy = Math.min(0.995, this.accuracy + (Math.random() * 0.005));
    
    db.tasks.insert({
      round: this.currentRound,
      accuracy: this.accuracy,
      timestamp: new Date(),
      participants: this.nodes.size
    });
    
    console.log(`Global Model Aggregated: Round ${this.currentRound}, Acc: ${this.accuracy.toFixed(4)}`);
  }
}

module.exports = new FLService();
