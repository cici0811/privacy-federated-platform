import React, { useState, useEffect } from 'react';
import { Network, Server, Wifi, Activity, Database, Cloud, Share2, Globe, Cpu, RefreshCw, Layers, Lock, MoreHorizontal, Play, StopCircle, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api } from '../src/api';

const NetworkView: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  const normalizeNode = (n: any) => {
    const rawSpecs = n?.specs;
    const specs =
      rawSpecs && typeof rawSpecs === 'object'
        ? {
            cpu: rawSpecs.cpu ?? '8 Core',
            ram: rawSpecs.ram ?? '16GB',
            npu: typeof rawSpecs.npu === 'boolean' ? rawSpecs.npu : true
          }
        : { cpu: '8 Core', ram: '16GB', npu: true };

    const role = typeof n?.role === 'string' && n.role.length > 0 ? n.role : 'participant';
    const status = typeof n?.status === 'string' && n.status.length > 0 ? n.status : 'offline';

    return {
      ...n,
      id: n?.id ?? `node-${Math.random().toString(16).slice(2)}`,
      name: typeof n?.name === 'string' && n.name.length > 0 ? n.name : '联邦节点',
      ip: typeof n?.ip === 'string' && n.ip.length > 0 ? n.ip : '0.0.0.0',
      role,
      status,
      latency: Number.isFinite(n?.latency) ? n.latency : Math.floor(Math.random() * 50 + 10),
      contribution: Number.isFinite(n?.contribution) ? n.contribution : 0,
      specs,
      modelHash: String(n?.modelHash ?? 'hash-init'),
      lastSeen: typeof n?.lastSeen === 'string' && n.lastSeen.length > 0 ? n.lastSeen : 'Just now'
    };
  };

  // Generate mock chart data
  useEffect(() => {
    const data = [];
    let acc = 85;
    let loss = 0.5;
    for (let i = 0; i < 20; i++) {
      acc = Math.min(99, acc + Math.random() * 2 - 0.5);
      loss = Math.max(0.01, loss - Math.random() * 0.05);
      data.push({
        name: `Round ${i * 5}`,
        accuracy: parseFloat(acc.toFixed(2)),
        loss: parseFloat(loss.toFixed(3))
      });
    }
    setChartData(data);

    const interval = setInterval(() => {
      setChartData(prev => {
        const last = prev[prev.length - 1];
        const newAcc = Math.min(99.9, last.accuracy + (Math.random() - 0.4) * 0.5);
        const newLoss = Math.max(0.001, last.loss * (0.95 + Math.random() * 0.1));
        return [...prev.slice(1), {
          name: `Round ${parseInt(last.name.split(' ')[1]) + 5}`,
          accuracy: parseFloat(newAcc.toFixed(2)),
          loss: parseFloat(newLoss.toFixed(3))
        }];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchNodes = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const res = await api.getNodesList(token);
      if (res.success) {
        // Transform backend data to frontend model if needed
        const mappedNodes = res.nodes.map(normalizeNode);
        setNodes(mappedNodes);
        if (!selectedNode && mappedNodes.length > 0) setSelectedNode(mappedNodes[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNodes();
    
    // Auto refresh every 5s
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchNodes();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500 bg-green-50 border-green-200';
      case 'offline': return 'text-gray-500 bg-gray-50 border-gray-200';
      case 'training': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'syncing': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatRole = (role: any) => {
    const r = String(role ?? '').trim();
    if (!r) return 'Participant';
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs font-bold uppercase mb-1">活跃节点</p>
            <h3 className="text-3xl font-bold">{nodes.filter(n => n.status === 'online' || n.status === 'training').length} / {nodes.length}</h3>
            <div className="mt-4 flex items-center text-xs text-indigo-200">
              <Activity size={14} className="mr-1 animate-pulse" />
              <span>网络健康</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">平均延迟</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {Math.round(nodes.reduce((acc, n) => acc + n.latency, 0) / nodes.length)} ms
            </h3>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: '35%' }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">全局准确率</p>
            <h3 className="text-2xl font-bold text-gray-900">94.8%</h3>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">总贡献量</p>
            <h3 className="text-2xl font-bold text-gray-900">1.2 PB</h3>
          </div>
          <div className="flex -space-x-2 mt-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-600">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] text-gray-500">+8</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden">
        
        {/* Left Column: Charts & Node List */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           {/* Chart Section */}
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-64 shrink-0 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm">
                  <Activity size={16} className="mr-2 text-primary-600" />
                  联邦训练监控 (Accuracy vs Loss)
                </h3>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                    <span className="text-gray-500">准确率</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span>
                    <span className="text-gray-500">损失值</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" domain={[80, 100]} tick={{fontSize: 10}} axisLine={false} tickLine={false} hide />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tick={{fontSize: 10}} axisLine={false} tickLine={false} hide />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                      labelStyle={{fontSize: '12px', fontWeight: 'bold', color: '#374151'}}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                    <Area yAxisId="right" type="monotone" dataKey="loss" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorLoss)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Node List */}
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Server size={18} className="mr-2 text-gray-600" />
              联邦节点列表
            </h3>
            <button 
              onClick={handleRefresh}
              className={`p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-all ${isRefreshing ? 'animate-spin text-primary-600' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {nodes.map(node => (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    selectedNode?.id === node.id 
                      ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-300' 
                      : 'bg-white border-gray-100 hover:border-primary-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${node.role === 'coordinator' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                      {node.role === 'coordinator' ? <Share2 size={20} /> : <Server size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{node.name}</h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                        <span className="font-mono">{node.ip}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded capitalize ${getStatusColor(node.status)}`}>
                          {node.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-right">
                    <div className="hidden sm:block">
                      <p className="text-[10px] text-gray-400 uppercase">延迟</p>
                      <p className={`text-sm font-bold font-mono ${node.latency > 100 ? 'text-red-500' : 'text-green-600'}`}>
                        {node.latency}ms
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] text-gray-400 uppercase">贡献</p>
                      <p className="text-sm font-bold text-primary-600">{node.contribution.toFixed(1)}%</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                       <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors" title="详情">
                         <Info size={16} />
                       </button>
                       <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-green-600 transition-colors" title="Ping">
                         <Activity size={16} />
                       </button>
                       <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors">
                         <MoreHorizontal size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Node Details Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-full">
          {selectedNode ? (
            <>
              <div className="p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedNode.status)}`}>
                    {selectedNode.status.toUpperCase()}
                  </div>
                  <span className="text-xs font-mono text-gray-400">{selectedNode.id}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedNode.name}</h2>
                <p className="text-sm text-gray-500 flex items-center">
                  <Globe size={14} className="mr-1" /> 
                  角色: {formatRole(selectedNode.role)}
                </p>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto min-h-0">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                    <Cpu size={14} className="mr-1.5" /> 硬件规格
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-[10px] text-gray-500">CPU 核心数</p>
                      <p className="font-bold text-gray-800 text-sm">{selectedNode.specs.cpu}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-[10px] text-gray-500">内存</p>
                      <p className="font-bold text-gray-800 text-sm">{selectedNode.specs.ram}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-gray-500">AI 加速器</p>
                        <p className="font-bold text-gray-800 text-sm">{selectedNode.specs.npu ? '神经处理单元 (NPU)' : '标准 GPU'}</p>
                      </div>
                      {selectedNode.specs.npu && <Activity className="text-green-500" size={18} />}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                    <Lock size={14} className="mr-1.5" /> 安全上下文
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                      <span className="text-gray-600">模型哈希</span>
                      <span className="font-mono text-xs text-primary-600 truncate max-w-[120px]" title={String(selectedNode.modelHash)}>
                        {String(selectedNode.modelHash).slice(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                      <span className="text-gray-600">加密方式</span>
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">CKKS-HE</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                      <span className="text-gray-600">最后握手</span>
                      <span className="text-gray-800 font-medium">{selectedNode.lastSeen}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-start">
                    <Wifi size={16} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-bold text-blue-900">实时指标</h5>
                      <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                        吞吐量: {(Math.random() * 50 + 10).toFixed(1)} MB/s<br/>
                        丢包率: {(Math.random() * 0.5).toFixed(2)}%<br/>
                        抖动: {(Math.random() * 5).toFixed(1)}ms
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <Network size={64} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">从列表中选择一个节点以查看详细遥测和安全上下文。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkView;
