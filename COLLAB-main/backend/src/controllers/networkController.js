const flService = require('../services/flService');
const db = require('../models/db');

exports.getNodes = async (req, res) => {
  try {
    // Combine real-time status with persistent metadata
    const activeNodes = flService.getNodes();
    const allNodes = await db.nodes.find({});
    
    // Create a map to combine data
    const nodesMap = new Map();
    
    // 1. Add persistent nodes (assume offline initially)
    allNodes.forEach(node => {
      nodesMap.set(node.id, { ...node, status: 'offline' });
    });
    
    // 2. Add/Overlay active nodes
    activeNodes.forEach(node => {
      const existing = nodesMap.get(node.id) || {};
      nodesMap.set(node.id, { ...existing, ...node, status: 'online' });
    });
    
    res.json({ success: true, nodes: Array.from(nodesMap.values()) });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNodeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // Try to find in DB first
    let node = await db.nodes.findOne({ id });
    
    // Try to find in memory (active nodes)
    const memoryNode = flService.getNodes().find(n => n.id === id);
    
    if (!node && !memoryNode) {
      return res.status(404).json({ success: false, message: 'Node not found' });
    }
    
    // Combine data
    const result = { ...(node || {}), ...(memoryNode || {}) };
    // If in memory, it's online
    if (memoryNode) result.status = 'online';
    
    res.json({ success: true, node: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
