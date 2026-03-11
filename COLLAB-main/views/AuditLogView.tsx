import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Info, CheckCircle, Search, Filter, 
  Download, Clock, Database, Lock, Terminal, CalendarDays, X, CheckCircle2, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../src/api';

const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [timePreset, setTimePreset] = useState<'all' | '24h' | '7d' | '30d' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [exportedFileName, setExportedFileName] = useState('');
  const [exportHint, setExportHint] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const res = await api.getAuditLogs(token);
        if (!res?.success || !Array.isArray(res?.logs)) throw new Error(res?.message || '加载失败');
        const normalizedLogs = res.logs.map((l: any) => ({
          id: l._id || l.id,
          timestamp: l.timestamp,
          level: l.level || 'info',
          event: l.type || l.event,
          source: l.nodeId || 'System',
          hash: l.hash || 'N/A'
        }));
        setIsDemoData(false);
        setLogs(normalizedLogs);
      } catch (e) {
        const now = Date.now();
        const levels = ['info', 'warning', 'critical', 'success'];
        const events = [
          '用户登录',
          '权限校验',
          '隐私检查(Privacy)',
          '密钥轮换',
          'CKKS 加密(Encryption)',
          '联邦节点握手',
          '模型更新上传',
          '风险告警'
        ];
        const demo = Array.from({ length: 28 }).map((_, i) => {
          const level = levels[i % levels.length];
          const event = events[i % events.length];
          const ts = new Date(now - i * 1000 * 60 * 17).toISOString();
          const id = `AUD-${String(100000 + i)}`;
          const source = i % 3 === 0 ? `Node-${String.fromCharCode(65 + (i % 5))}` : 'System';
          const hash = `sha256_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 42);
          return { id, timestamp: ts, level, event, source, hash };
        });
        setIsDemoData(true);
        setLogs(demo);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getTimeWindow = () => {
    const now = Date.now();
    if (timePreset === '24h') return { from: now - 24 * 60 * 60 * 1000, to: now };
    if (timePreset === '7d') return { from: now - 7 * 24 * 60 * 60 * 1000, to: now };
    if (timePreset === '30d') return { from: now - 30 * 24 * 60 * 60 * 1000, to: now };
    if (timePreset === 'custom') {
      const from = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
      const to = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null;
      return { from, to };
    }
    return { from: null, to: null };
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || log.level === filterLevel;
    const window = getTimeWindow();
    const t = new Date(log.timestamp).getTime();
    const matchesTime =
      (!window.from || t >= window.from) &&
      (!window.to || t <= window.to);
    return matchesSearch && matchesFilter && matchesTime;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="text-red-500" size={16} />;
      case 'warning': return <Info className="text-yellow-500" size={16} />;
      case 'success': return <CheckCircle className="text-green-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  const getLevelBadge = (level: string) => {
    const classes = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${classes[level as keyof typeof classes]}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  const openLogDetail = (log: any) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  const handleExport = () => {
    const rows = filteredLogs.map((l) => ({
      '时间戳': new Date(l.timestamp).toLocaleString(),
      '级别': String(l.level).toUpperCase(),
      '事件类型': l.event,
      '来源': l.source,
      '哈希(SHA-256)': l.hash,
      '日志ID': l.id
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '审计日志');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const name = `audit-logs-${ts}.xlsx`;
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setExportedFileName(name);
    setExportHint('已导出为 Excel 文件。保存位置为浏览器默认下载目录（通常为“下载/Downloads”）。');
    setShowExportSuccess(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-blue-50 rounded-lg mr-4">
            <Database className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">总日志数</p>
            <h3 className="text-2xl font-bold text-gray-900">{logs.length}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-red-50 rounded-lg mr-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">关键事件</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {logs.filter(l => l.level === 'critical').length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-green-50 rounded-lg mr-4">
            <ShieldCheck className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">隐私检查</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {logs.filter(l => l.event.includes('Privacy')).length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-purple-50 rounded-lg mr-4">
            <Lock className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">加密操作</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {logs.filter(l => l.event.includes('Encryption') || l.event.includes('CKKS')).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        {isDemoData && (
          <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 text-yellow-800 text-xs font-medium flex items-center justify-between">
            <span>当前展示为演示数据（未登录或后端无日志数据时自动启用）</span>
            <span className="font-mono text-yellow-700">DEMO</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Terminal size={20} className="mr-2 text-gray-600" />
              系统安全审计日志
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="搜索日志 ID / 事件..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 w-full sm:w-64 outline-none"
              />
            </div>
            
            <div className="relative">
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">全部级别</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="success">Success</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <div className="flex items-center space-x-2">
              <CalendarDays className="text-gray-400" size={16} />
              <select
                value={timePreset}
                onChange={(e) => setTimePreset(e.target.value as any)}
                className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">全部时间</option>
                <option value="24h">近 24 小时</option>
                <option value="7d">近 7 天</option>
                <option value="30d">近 30 天</option>
                <option value="custom">自定义</option>
              </select>
            </div>

            <div className={`flex items-center space-x-2 ${timePreset === 'custom' ? '' : 'opacity-60'}`}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={timePreset !== 'custom'}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={timePreset !== 'custom'}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <button
              onClick={handleExport}
              className="flex items-center px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
              title="导出日志为 Excel"
              disabled={filteredLogs.length === 0}
            >
              <FileSpreadsheet size={16} className="mr-2" />
              导出 Excel
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-2">日志 ID</div>
          <div className="col-span-2">时间戳</div>
          <div className="col-span-1">级别</div>
          <div className="col-span-3">事件类型</div>
          <div className="col-span-2">来源</div>
          <div className="col-span-2">哈希 (SHA-256)</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => openLogDetail(log)}
                  className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors items-center text-sm cursor-pointer"
                >
                  <div className="col-span-2 font-mono text-gray-500 text-xs">{log.id}</div>
                  <div className="col-span-2 text-gray-600 flex items-center text-xs">
                    <Clock size={12} className="mr-1.5 text-gray-400" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="col-span-1">
                    {getLevelBadge(log.level)}
                  </div>
                  <div className="col-span-3 font-medium text-gray-900 flex items-center">
                    {getLevelIcon(log.level)}
                    <span className="ml-2 truncate" title={log.event}>{log.event}</span>
                  </div>
                  <div className="col-span-2 text-gray-600 text-xs">{log.source}</div>
                  <div className="col-span-2 font-mono text-xs text-gray-400 truncate" title={log.hash}>
                    {log.hash}
                  </div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p>没有找到匹配的日志记录</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>显示 {filteredLogs.length} / {logs.length} 条记录</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50">上一页</button>
            <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50">下一页</button>
          </div>
        </div>
      </div>

      {showLogDetail && selectedLog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">日志详情</h3>
                <p className="text-xs text-gray-500 font-mono mt-1">{selectedLog.id}</p>
              </div>
              <button onClick={() => setShowLogDetail(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">时间戳</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">级别</p>
                  <div className="mt-2">{getLevelBadge(selectedLog.level)}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 col-span-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">事件类型</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedLog.event}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">来源</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedLog.source}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">哈希 (SHA-256)</p>
                  <p className="text-xs font-mono text-gray-700 mt-1 break-all">{selectedLog.hash}</p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowLogDetail(false)} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-100">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">导出成功</h3>
              <p className="text-sm text-gray-500 mt-2">日志已导出为 Excel 文件</p>
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-gray-500 uppercase">文件名</p>
                <p className="text-sm font-mono text-gray-800 mt-1 break-all">{exportedFileName}</p>
                <p className="text-xs text-gray-500 mt-3">{exportHint}</p>
              </div>
              <button
                onClick={() => setShowExportSuccess(false)}
                className="mt-7 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogView;
