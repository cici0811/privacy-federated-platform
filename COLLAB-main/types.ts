/**
 * 秘协作 (Secret Collab) - 类型定义库
 * 
 * 包含所有前端视图状态、业务实体接口、枚举及工具类型
 * @version 2.0.0
 */

// =================================================================================
// 1. 全局视图状态枚举 (Global View States)
// =================================================================================

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCHEDULER = 'SCHEDULER',
  TRAVEL = 'TRAVEL',
  RECOMMENDATION = 'RECOMMENDATION',
  AGENT_CONFIG = 'AGENT_CONFIG',
  ANALYTICS = 'ANALYTICS',
  // New Views
  NETWORK = 'NETWORK',
  AUDIT_LOG = 'AUDIT_LOG'
}

// =================================================================================
// 2. 隐私与安全枚举 (Privacy & Security Enums)
// =================================================================================

export enum PrivacyLevel {
  BASIC = '基础级',
  ENHANCED = '增强级',
  EXTREME = '极致级'
}

export enum EncryptionMethod {
  CKKS = 'CKKS (Homomorphic)',
  AES_GCM = 'AES-256-GCM',
  MPC_GARBLED_CIRCUIT = 'MPC (Garbled Circuits)',
  DP_LAPLACE = 'Differential Privacy (Laplace)',
  DP_GAUSSIAN = 'Differential Privacy (Gaussian)'
}

export enum NodeRole {
  COORDINATOR = 'coordinator',
  WORKER = 'worker',
  VALIDATOR = 'validator',
  OBSERVER = 'observer'
}

// =================================================================================
// 3. 核心业务实体接口 (Core Business Entities)
// =================================================================================

/**
 * 代理状态接口
 */
export interface AgentStatus {
  id: string;
  name: string;
  status: 'online' | 'training' | 'offline' | 'syncing' | 'error';
  privacyScore: number;
  tasksCompleted: number;
  lastActive: string;
  version: string;
  config: {
    maxConcurrency: number;
    privacyBudget: number;
    allowExternal: boolean;
  };
}

/**
 * 日程候选方案接口
 */
export interface ScheduleCandidate {
  id: string;
  timeSlot: string;
  matchScore: number;
  conflictCount: number;
  encryptionHash: string;
  participants: {
    id: string;
    status: 'accepted' | 'tentative' | 'declined';
  }[];
  metadata?: {
    location?: string;
    virtualLink?: string;
  };
}

/**
 * 日程请求接口
 */
export interface ScheduleRequest {
  id: string;
  title: string;
  requesterId: string;
  participants: string[];
  duration: number; // minutes
  privacyLevel: PrivacyLevel;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

/**
 * 联邦学习任务接口
 */
export interface FederatedTask {
  taskId: string;
  type: 'classification' | 'regression' | 'clustering' | 'recommendation';
  round: number;
  totalRounds: number;
  participants: number;
  accuracy: number;
  loss: number;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
}

/**
 * 推荐系统实体接口
 */
export interface RecommendationItem {
  id: string;
  type: 'hotel' | 'flight' | 'restaurant' | 'activity';
  name: string;
  description: string;
  rating: number;
  price: number;
  currency: string;
  matchReason: string; // 推荐理由 (e.g., "Based on your preference for quiet spaces")
  imageUrl?: string;
  privacyTags: string[]; // e.g., ["Location-Fuzzed", "Identity-Masked"]
}

// =================================================================================
// 4. 工具类型 (Utility Types)
// =================================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface APIResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}
