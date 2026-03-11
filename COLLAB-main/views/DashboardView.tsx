import React, { useState, useEffect } from 'react';
import { CalendarRange, Map, Sparkles, Settings, ArrowRight, Clock, Shield, CheckCircle2, XCircle, Loader2, Download, UserPlus, FileText, X, ChevronRight, UserCheck, AlertCircle, Share2, Network, Activity } from 'lucide-react';
import { ViewState } from '../types';
import { getGreeting, formatBytes } from '../src/utils/format';
import { api, socketService } from '../src/api';

interface DashboardViewProps {
  onChangeView: (view: ViewState) => void;
}

interface TodoItem {
  id: number;
  title: string;
  sender: string;
  time: string;
  type: string;
  urgency: 'high' | 'medium' | 'low';
  match: string;
  status: 'pending' | 'processing' | 'done' | 'rejected';
}

const DashboardView: React.FC<DashboardViewProps> = ({ onChangeView }) => {
  // State for To-Do List
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: 1, title: 'Q4 产品战略复盘会议', sender: 'Alice (产品)', time: '10分钟前', type: '会议邀请', urgency: 'high', match: '98%', status: 'pending' },
    { id: 2, title: '杭州出差行程确认', sender: '携程商旅代理', time: '1小时前', type: '行程方案', urgency: 'medium', match: '92%', status: 'pending' },
    { id: 3, title: '团队团建地点投票', sender: 'HR 小助手', time: '3小时前', type: '协作推荐', urgency: 'low', match: '85%', status: 'pending' },
  ]);

  // State for Modals & Feedback
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportBlobUrl, setReportBlobUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock Data for Contacts
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Alice', dept: '产品部', trusted: true, risk: '低' },
    { id: 2, name: 'Bob', dept: '研发中心', trusted: true, risk: '低' },
    { id: 3, name: 'Charlie', dept: '设计部', trusted: false, risk: '中' },
    { id: 4, name: 'David', dept: '法务部', trusted: true, risk: '低' },
  ]);

  const [activeNodes, setActiveNodes] = useState(8); // Default fallback

  // Connect to backend
  useEffect(() => {
    // 1. Check API Health
    api.checkHealth().then(res => {
      if (res.status === 'ok') {
        console.log('Backend is online');
      }
    });

    // 2. Connect WebSocket
    const socket = socketService.connect();
    
    socket.on('network-update', (data: any) => {
      if (data && data.count) {
        setActiveNodes(data.count);
      }
    });

    return () => {
      socket.off('network-update');
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (id: number, action: 'accept' | 'reject') => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'processing' };
      }
      return t;
    }));

    setTimeout(() => {
      setTodos(prev => prev.map(t => {
        if (t.id === id) {
          return { ...t, status: action === 'accept' ? 'done' : 'rejected' };
        }
        return t;
      }));
      showToast(action === 'accept' ? '已接受并加入联邦日程' : '已拒绝该请求');
    }, 1200);
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const blob = await api.exportReport(token);
      const url = window.URL.createObjectURL(blob);
      setReportBlobUrl(url);
      setShowReportModal(true);
      showToast("本地合规报告已生成");
    } catch (e) {
      console.error(e);
      showToast("导出失败，请检查网络连接");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleTrust = (id: number) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, trusted: !c.trusted } : c));
  };

  const features = [
    { 
      title: '联邦会议', 
      desc: '零隐私泄露的时间调度', 
      icon: CalendarRange, 
      color: 'text-primary-600', 
      bg: 'bg-primary-50',
      action: () => onChangeView(ViewState.SCHEDULER)
    },
    { 
      title: '跨域行程', 
      desc: '隐私保护下的多方出行', 
      icon: Map, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      action: () => onChangeView(ViewState.TRAVEL) 
    },
    { 
      title: '智能推荐', 
      desc: '基于联邦学习的资源匹配', 
      icon: Sparkles, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      action: () => onChangeView(ViewState.RECOMMENDATION)
    },
    { 
      title: '协作管理', 
      desc: '权限与数据生命周期', 
      icon: Settings, 
      color: 'text-slate-600', 
      bg: 'bg-slate-50',
      action: () => onChangeView(ViewState.AGENT_CONFIG)
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center animate-in slide-in-from-right fade-in z-50">
          <CheckCircle2 size={18} className="text-success-500 mr-2" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Modal: System Update Log */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center">
                <FileText size={18} className="mr-2 text-primary-600" />
                系统更新日志
              </h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="relative pl-4 border-l-2 border-primary-200">
                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-primary-600"></div>
                <h4 className="font-bold text-gray-900 text-sm">v3.2.1 (当前版本)</h4>
                <p className="text-xs text-gray-500 mb-2">2026-05-15</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>优化 Gemini 3 Lite 本地推理速度，提升 15%</li>
                  <li>新增“跨域行程”多人协同加密算法</li>
                  <li>修复了部分安卓设备上的联邦学习梯度同步延迟</li>
                </ul>
              </div>
              <div className="relative pl-4 border-l-2 border-gray-200">
                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <h4 className="font-bold text-gray-900 text-sm">v3.2.0</h4>
                <p className="text-xs text-gray-500 mb-2">2026-04-28</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>正式引入“智能推荐”模块</li>
                  <li>升级 CKKS 同态加密库至 v2.0</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <button onClick={() => setShowUpdateModal(false)} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Trusted Contacts */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center">
                <UserCheck size={18} className="mr-2 text-primary-600" />
                管理信任联系人
              </h3>
              <button onClick={() => setShowContactsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-2">
              <div className="bg-blue-50 p-3 m-3 rounded-lg flex items-start text-xs text-blue-700">
                <AlertCircle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>信任联系人可以请求“增强级”隐私协作（如模糊位置共享），非信任联系人仅能进行“极致级”协作（仅结果可见）。</p>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${c.trusted ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.dept}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${c.trusted ? 'bg-success-50 text-success-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.trusted ? '已信任' : '未授权'}
                      </span>
                      <button 
                        onClick={() => toggleTrust(c.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                          c.trusted 
                          ? 'border-gray-200 text-gray-600 hover:bg-gray-50' 
                          : 'bg-primary-600 text-white border-transparent hover:bg-primary-700'
                        }`}
                      >
                        {c.trusted ? '撤销' : '授权'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700">
                <UserPlus size={16} className="mr-1" />
                添加新联系人
              </button>
              <button onClick={() => setShowContactsModal(false)} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black transition-colors">
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Report Preview */}
      {showReportModal && reportBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center">
                <FileText size={18} className="mr-2 text-primary-600" />
                本地合规报告预览
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 overflow-hidden relative">
              <iframe 
                src={reportBlobUrl} 
                className="w-full h-full border-0"
                title="Compliance Report"
              />
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowReportModal(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
              <a 
                href={reportBlobUrl} 
                download="compliance_report.pdf"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Download size={16} className="mr-2" />
                下载 PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              {getGreeting()}，王总监 <span className="ml-2 text-2xl animate-pulse">👋</span>
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">蜂群智能 (Swarm AI) 运行中，已连接 <span className="font-bold text-gray-700">{activeNodes}</span> 个联邦节点。</p>
          </div>
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            <Clock size={16} className="text-primary-600 mr-2" />
            <div className="text-right">
               <p className="text-xs text-gray-400 font-medium">下次会议</p>
               <p className="text-sm font-bold text-gray-700">14:30 (已同步)</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="relative z-10">
            <h3 className="font-bold text-sm text-indigo-100 flex items-center mb-1">
              <Share2 size={14} className="mr-1.5" />
              联邦协作状态
            </h3>
            <div className="flex items-end space-x-1">
              <span className="text-2xl font-bold">在线</span>
              <span className="text-xs text-indigo-200 mb-1.5">/ 24ms</span>
            </div>
          </div>
          <div className="relative z-10 flex space-x-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-2 h-8 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: `${i*150}ms`, height: `${Math.random()*20 + 10}px` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, idx) => (
          <button 
            key={idx} 
            onClick={f.action}
            className="flex flex-col items-start p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-primary-300 group text-left relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-16 h-16 ${f.bg} rounded-bl-full opacity-50 group-hover:scale-125 transition-transform origin-top-right`}></div>
            <div className={`p-2.5 rounded-lg ${f.bg} ${f.color} mb-3 relative z-10`}>
              <f.icon size={22} />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-0.5 relative z-10">{f.title}</h3>
            <p className="text-xs text-gray-500 relative z-10">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full">
        {/* To-Do List */}
        <div className="lg:col-span-2 xl:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center">
              <span className="w-1.5 h-5 bg-primary-600 rounded-full mr-2.5"></span>
              待处理协作 (To-Do)
            </h3>
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded-md">
              {todos.filter(t => t.status === 'pending').length} 条未读
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {todos.filter(t => t.status !== 'rejected').map((item) => (
              <div key={item.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${item.status === 'done' ? 'opacity-50 bg-gray-50/50' : ''}`}>
                <div className="flex items-start space-x-3 cursor-pointer" onClick={() => item.status === 'pending' && item.type === '会议邀请' ? onChangeView(ViewState.SCHEDULER) : null}>
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    item.status === 'done' ? 'bg-gray-300' :
                    item.urgency === 'high' ? 'bg-red-500' : 
                    item.urgency === 'medium' ? 'bg-orange-500' : 'bg-primary-500'
                  }`} />
                  <div>
                    <h4 className={`font-bold text-sm ${item.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{item.title}</h4>
                    <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
                      <span className="font-medium text-gray-500">{item.sender}</span>
                      <span>•</span>
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
                
                {item.status === 'pending' ? (
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right mr-1 hidden sm:block">
                      <p className="text-[10px] text-gray-400 uppercase">匹配度</p>
                      <p className="text-base font-bold text-success-600 leading-none">{item.match}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAction(item.id, 'reject')}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="拒绝"
                      >
                        <XCircle size={22} />
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'accept')}
                        className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-full transition-colors"
                        title="接受并加入日程"
                      >
                        <CheckCircle2 size={22} />
                      </button>
                    </div>
                  </div>
                ) : item.status === 'processing' ? (
                  <div className="flex items-center text-primary-600 px-4">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    <span className="text-xs font-medium">联邦同步中...</span>
                  </div>
                ) : (
                  <div className="flex items-center text-success-600 px-4">
                    <CheckCircle2 size={18} className="mr-2" />
                    <span className="text-xs font-medium">已完成</span>
                  </div>
                )}
              </div>
            ))}
            {todos.length === 0 && (
               <div className="p-8 text-center text-gray-400 text-sm">暂无待办事项</div>
            )}
          </div>
          <button className="p-3 text-center text-xs font-medium text-gray-400 hover:text-primary-600 hover:bg-gray-50 transition-colors border-t border-gray-100">
            查看全部历史记录
          </button>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary-700 to-gray-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => onChangeView(ViewState.ANALYTICS)}>
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
               <Shield size={80} />
            </div>
            <div className="flex justify-between items-start mb-2">
               <div>
                  <h4 className="text-primary-200 text-xs font-bold uppercase tracking-wide">隐私安全评分</h4>
                  <div className="text-3xl font-bold mt-1">98.5</div>
               </div>
               <span className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-medium border border-white/20">极致级</span>
            </div>
            
            <div className="space-y-2 mt-4">
              <div>
                 <div className="flex justify-between text-[10px] text-primary-200 mb-1">
                   <span>本地数据处理</span>
                   <span className="font-mono">842 MB</span>
                 </div>
                 <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden">
                   <div className="bg-success-400 h-full rounded-full" style={{ width: '92%' }}></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-[10px] text-primary-200 mb-1">
                   <span>云端加密摘要</span>
                   <span className="font-mono">12 KB</span>
                 </div>
                 <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden">
                   <div className="bg-yellow-400 h-full rounded-full" style={{ width: '5%' }}></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3 px-1">快捷入口</h4>
            <div className="space-y-2">
              <button 
                onClick={handleExportReport}
                disabled={isExporting}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 hover:text-primary-600 text-xs font-medium text-gray-600 flex justify-between items-center group transition-colors"
              >
                <div className="flex items-center">
                  {isExporting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Download size={14} className="mr-2 text-gray-400 group-hover:text-primary-500" />}
                  {isExporting ? '正在生成加密报告...' : '导出本地合规报告'}
                </div>
                {!isExporting && <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500" />}
              </button>
              
              <button 
                onClick={() => setShowContactsModal(true)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 hover:text-primary-600 text-xs font-medium text-gray-600 flex justify-between items-center group transition-colors"
              >
                <div className="flex items-center">
                  <UserPlus size={14} className="mr-2 text-gray-400 group-hover:text-primary-500" />
                  管理信任联系人
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500" />
              </button>
              
              <button 
                onClick={() => setShowUpdateModal(true)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 hover:text-primary-600 text-xs font-medium text-gray-600 flex justify-between items-center group transition-colors"
              >
                <div className="flex items-center">
                  <FileText size={14} className="mr-2 text-gray-400 group-hover:text-primary-500" />
                  系统更新日志 (v3.2.1)
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500" />
              </button>

              <div className="pt-2 border-t border-gray-100 mt-2">
                 <button 
                  onClick={() => onChangeView(ViewState.NETWORK)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-gray-500 flex justify-between items-center group transition-colors"
                >
                  <div className="flex items-center">
                    <Network size={14} className="mr-2 text-gray-400 group-hover:text-indigo-500" />
                    查看联邦节点拓扑
                  </div>
                  <Activity size={12} className="text-gray-300 group-hover:text-indigo-500 animate-pulse" />
                </button>
                <button 
                  onClick={() => onChangeView(ViewState.AUDIT_LOG)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-xs font-medium text-gray-500 flex justify-between items-center group transition-colors"
                >
                  <div className="flex items-center">
                    <Shield size={14} className="mr-2 text-gray-400 group-hover:text-blue-500" />
                    安全审计日志
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;