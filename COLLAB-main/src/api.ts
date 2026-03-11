import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3001';

// REST API
export const api = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  register: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },
  
  getNodes: async () => {
    const response = await fetch(`${API_URL}/api/nodes`);
    return response.json();
  },
  
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      return response.json();
    } catch (e) {
      return { status: 'offline' };
    }
  },

  // Dashboard APIs
  getStats: async (token: string) => {
    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  getAuditLogs: async (token: string) => {
    const response = await fetch(`${API_URL}/api/dashboard/audit-logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Network APIs
  getNodesList: async (token: string) => {
    const response = await fetch(`${API_URL}/api/network`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getNodeDetails: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/network/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Agent APIs
  getAgentConfig: async (token: string) => {
    const response = await fetch(`${API_URL}/api/agent/config`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  updateAgentConfig: async (token: string, config: any) => {
    const response = await fetch(`${API_URL}/api/agent/config`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Analytics APIs
  getRiskAnalysis: async (token: string) => {
    const response = await fetch(`${API_URL}/api/analytics/risk`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Demo APIs
  encryptValue: async (token: string, value: number) => {
    const response = await fetch(`${API_URL}/api/demo/he/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ value })
    });
    return response.json();
  },

  computeSum: async (token: string, cipherA: string, cipherB: string) => {
    const response = await fetch(`${API_URL}/api/demo/he/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ cipherA, cipherB })
    });
    return response.json();
  },

  decryptValue: async (token: string, ciphertext: string) => {
    const response = await fetch(`${API_URL}/api/demo/he/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ciphertext })
    });
    return response.json();
  },

  // Scheduler APIs
  initiateMeeting: async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/api/scheduler/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getMeetingStatus: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/scheduler/status/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getMeetingCandidates: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/scheduler/candidates/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  confirmMeeting: async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/api/scheduler/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Travel APIs
  searchTravel: async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/api/travel/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getTravelResults: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/travel/results/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  bookTravel: async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/api/travel/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Recommendation APIs
  getRecommendations: async (token: string) => {
    const response = await fetch(`${API_URL}/api/recommendations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Report APIs
  exportReport: async (token: string) => {
    const response = await fetch(`${API_URL}/api/reports/export`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.blob();
  }
};

// WebSocket
class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(API_URL);
      
      this.socket.on('connect', () => {
        console.log('Connected to Federated Coordinator');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Federated Coordinator');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
