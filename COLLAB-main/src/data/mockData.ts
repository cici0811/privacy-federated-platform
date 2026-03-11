/**
 * 秘协作 (Secret Collab) - 模拟数据集
 * 包含：联邦节点、安全日志、历史会议记录、用户偏好向量、行程方案
 * 用于前端界面展示及算法演示
 * 
 * @version 3.2.1
 * @author Secret Collab Team
 */

import { PrivacyLevel } from '../../types';

// =================================================================================
// 1. 联邦节点网络模拟数据 (Federated Node Network)
// =================================================================================

export interface FederatedNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'training' | 'syncing';
  ip: string;
  latency: number; // ms
  modelHash: string;
  lastSeen: string;
  contribution: number; // 贡献度
  role: 'coordinator' | 'worker' | 'validator';
  specs: {
    cpu: string;
    ram: string;
    npu: boolean;
  };
}

export const FEDERATED_NODES: FederatedNode[] = [
  {
    id: 'node-alpha-001',
    name: 'Research-Center-Primary',
    status: 'online',
    ip: '10.2.4.15',
    latency: 12,
    modelHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    lastSeen: 'Now',
    contribution: 98.5,
    role: 'coordinator',
    specs: { cpu: '16 vCore', ram: '64GB', npu: true }
  },
  {
    id: 'node-beta-002',
    name: 'Marketing-Dept-Edge',
    status: 'training',
    ip: '10.2.5.22',
    latency: 45,
    modelHash: 'sha256:d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    lastSeen: '2s ago',
    contribution: 82.1,
    role: 'worker',
    specs: { cpu: '8 vCore', ram: '32GB', npu: true }
  },
  {
    id: 'node-gamma-003',
    name: 'Finance-Secure-Vault',
    status: 'syncing',
    ip: '10.2.8.99',
    latency: 120,
    modelHash: 'sha256:1e24132473489247835893275893427589342758943275894327589432758943',
    lastSeen: '5s ago',
    contribution: 99.9,
    role: 'validator',
    specs: { cpu: '32 vCore', ram: '128GB', npu: false }
  },
  {
    id: 'node-delta-004',
    name: 'Mobile-Client-User-A',
    status: 'online',
    ip: '192.168.1.101',
    latency: 85,
    modelHash: 'sha256:88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
    lastSeen: '1s ago',
    contribution: 45.2,
    role: 'worker',
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16GB', npu: true }
  },
  {
    id: 'node-epsilon-005',
    name: 'Mobile-Client-User-B',
    status: 'offline',
    ip: '192.168.1.105',
    latency: 0,
    modelHash: 'sha256:a5b4c3d2e1f0...[truncated]',
    lastSeen: '15m ago',
    contribution: 32.8,
    role: 'worker',
    specs: { cpu: 'A17 Pro', ram: '8GB', npu: true }
  },
  {
    id: 'node-zeta-006',
    name: 'HR-Admin-Portal',
    status: 'online',
    ip: '10.2.1.5',
    latency: 18,
    modelHash: 'sha256:c6d7e8f9a0b1...[truncated]',
    lastSeen: 'Now',
    contribution: 76.4,
    role: 'worker',
    specs: { cpu: '12 vCore', ram: '48GB', npu: false }
  },
  {
    id: 'node-eta-007',
    name: 'Sales-Region-East',
    status: 'training',
    ip: '10.3.4.12',
    latency: 210,
    modelHash: 'sha256:f1e2d3c4b5a6...[truncated]',
    lastSeen: '8s ago',
    contribution: 65.0,
    role: 'worker',
    specs: { cpu: '16 vCore', ram: '64GB', npu: true }
  },
  {
    id: 'node-theta-008',
    name: 'DevOps-Monitor-Cluster',
    status: 'online',
    ip: '10.1.1.200',
    latency: 5,
    modelHash: 'sha256:9a8b7c6d5e4f...[truncated]',
    lastSeen: 'Now',
    contribution: 91.3,
    role: 'validator',
    specs: { cpu: '64 vCore', ram: '256GB', npu: false }
  }
];

// =================================================================================
// 2. 安全审计日志 (Security Audit Logs)
// =================================================================================

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  level: 'info' | 'warning' | 'critical' | 'success';
  source: string;
  details: string;
  hash: string;
}

export const generateAuditLogs = (count: number): AuditLog[] => {
  const events = [
    'CKKS Key Generation',
    'Federated Gradient Aggregation',
    'Local Model Update',
    'Privacy Budget Check',
    'Outlier Detection',
    'Secure Multiparty Computation',
    'Access Control Verification',
    'Data Encryption',
    'Network Handshake'
  ];
  
  const sources = [
    'System Kernel',
    'Federated Module',
    'Privacy Engine',
    'Network Layer',
    'User Agent',
    'Audit Daemon'
  ];

  const logs: AuditLog[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const time = new Date(now - i * Math.random() * 600000).toISOString(); // Random time in last X hours
    const levelRand = Math.random();
    let level: AuditLog['level'] = 'info';
    if (levelRand > 0.95) level = 'critical';
    else if (levelRand > 0.85) level = 'warning';
    else if (levelRand > 0.7) level = 'success';

    logs.push({
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: time,
      event: events[Math.floor(Math.random() * events.length)],
      level: level,
      source: sources[Math.floor(Math.random() * sources.length)],
      details: `Process ID: ${Math.floor(Math.random() * 10000)} | Thread: Worker-${Math.floor(Math.random() * 8)}`,
      hash: Math.random().toString(16).substr(2, 16)
    });
  }
  return logs;
};

export const AUDIT_LOGS = generateAuditLogs(150); // 生成150条日志

// =================================================================================
// 3. 历史会议记录 (Historical Meeting Data)
// =================================================================================

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  duration: number; // minutes
  participants: number;
  privacyScore: number;
  conflictResolved: boolean;
  type: 'internal' | 'external' | 'workshop' | 'review';
}

export const MEETING_HISTORY: MeetingRecord[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `mtg-${i + 1000}`,
  title: [
    'Q4 Product Roadmap Review',
    'Weekly Sync - Frontend Team',
    'Client Pitch - Project Alpha',
    'Design System Workshop',
    'Security Audit Preparation',
    'HR Policy Update',
    'Backend Architecture Deep Dive',
    'Marketing Campaign Brainstorming'
  ][Math.floor(Math.random() * 8)],
  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  duration: [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)],
  participants: Math.floor(Math.random() * 10) + 2,
  privacyScore: Math.floor(Math.random() * 20) + 80, // 80-100
  conflictResolved: Math.random() > 0.7,
  type: ['internal', 'external', 'workshop', 'review'][Math.floor(Math.random() * 4)] as any
}));

// =================================================================================
// 4. 用户偏好向量 (User Preference Embeddings)
// 模拟 LoRA 学习到的高维向量数据，用于展示
// =================================================================================

export const PREFERENCE_VECTORS = {
  time: [0.85, 0.12, 0.05, 0.92, 0.45, 0.11, 0.78, 0.33], // 对应不同时间段的偏好
  location: [0.22, 0.88, 0.45, 0.12, 0.67, 0.91, 0.05, 0.34], // 对应不同地点的偏好
  budget: [0.55, 0.66, 0.77, 0.88, 0.99, 0.11, 0.22, 0.33], // 对应预算敏感度
  collaboration: [0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25] // 对应协作意愿
};

export const MODEL_PARAMS = {
  baseModel: 'Llama-3-8B',
  quantization: '4-bit (GGUF)',
  loraRank: 8,
  loraAlpha: 16,
  contextWindow: 8192,
  temperature: 0.7,
  topP: 0.9,
  repetitionPenalty: 1.1,
  seed: 42
};
