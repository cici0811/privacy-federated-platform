/**
 * 秘协作 (Secret Collab) - 格式化工具库
 * 
 * 包含日期时间处理、数字格式化、文件大小转换等通用工具函数
 * @version 1.0.0
 */

// =================================================================================
// 1. 日期时间格式化 (Date & Time Formatting)
// =================================================================================

/**
 * 格式化为相对时间 (e.g., "2 hours ago")
 * @param dateString ISO 日期字符串
 */
export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
};

/**
 * 格式化为标准日期字符串 (YYYY-MM-DD HH:mm:ss)
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 获取友好的时间段问候语
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
};

// =================================================================================
// 2. 数据量与存储格式化 (Data Size Formatting)
// =================================================================================

/**
 * 格式化字节数
 * @param bytes 字节大小
 * @param decimals 小数位数
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// =================================================================================
// 3. 隐私与安全相关格式化 (Privacy & Security Formatting)
// =================================================================================

/**
 * 掩码处理 (Masking)
 * 用于在非授权状态下展示部分敏感信息
 * @param text 原始文本
 * @param visibleStart 开头可见位数
 * @param visibleEnd 结尾可见位数
 */
export const maskString = (text: string, visibleStart = 4, visibleEnd = 4): string => {
  if (!text || text.length <= visibleStart + visibleEnd) return text;
  return text.slice(0, visibleStart) + '****' + text.slice(-visibleEnd);
};

/**
 * 生成随机哈希值 (模拟)
 */
export const generateRandomHash = (length = 16): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// =================================================================================
// 4. 数字与货币格式化 (Number & Currency)
// =================================================================================

export const formatCurrency = (amount: number, currency = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-CN').format(num);
};
