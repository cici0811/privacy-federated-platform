import React, { useState } from 'react';
import { ViewState } from './types';
import { LayoutGrid, CalendarRange, Cpu, PieChart, Menu, Bell, ShieldCheck, Search, Map, Sparkles, Network, FileText } from 'lucide-react';
import DashboardView from './views/DashboardView';
import SchedulerView from './views/SchedulerView';
import AgentConfigView from './views/AgentConfigView';
import AnalyticsView from './views/AnalyticsView';
import RecommendationView from './views/RecommendationView';
import TravelView from './views/TravelView';
import LoginView from './views/LoginView';
import NetworkView from './views/NetworkView';
import AuditLogView from './views/AuditLogView';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <DashboardView onChangeView={setCurrentView} />;
      case ViewState.SCHEDULER:
        return <SchedulerView onBack={() => setCurrentView(ViewState.DASHBOARD)} />;
      case ViewState.TRAVEL:
        return <TravelView onBack={() => setCurrentView(ViewState.DASHBOARD)} />;
      case ViewState.RECOMMENDATION:
        return <RecommendationView onBack={() => setCurrentView(ViewState.DASHBOARD)} />;
      case ViewState.AGENT_CONFIG:
        return <AgentConfigView />;
      case ViewState.ANALYTICS:
        return <AnalyticsView />;
      case ViewState.NETWORK:
        return <NetworkView />;
      case ViewState.AUDIT_LOG:
        return <AuditLogView />;
      default:
        return <DashboardView onChangeView={setCurrentView} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 mb-1.5 rounded-lg transition-colors font-medium text-sm ${
        currentView === view
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} className="mr-3" />
      <span>{label}</span>
      {currentView === view && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600"></div>}
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b border-gray-100 flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 tracking-tight text-lg leading-tight">秘协作</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Secret Collab</p>
          </div>
        </div>

        {/* Real-time Clock Widget */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col">
            <span className="text-xl font-mono font-bold text-gray-800 tracking-tight">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[10px] font-medium text-gray-500 uppercase mt-0.5">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-2">
            核心功能
          </div>
          <NavItem view={ViewState.DASHBOARD} icon={LayoutGrid} label="协作中心" />
          <NavItem view={ViewState.SCHEDULER} icon={CalendarRange} label="联邦调度" />
          <NavItem view={ViewState.TRAVEL} icon={Map} label="跨域行程" />
          <NavItem view={ViewState.RECOMMENDATION} icon={Sparkles} label="智能推荐" />
          
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-6">
            系统管理
          </div>
          <NavItem view={ViewState.NETWORK} icon={Network} label="联邦网络" />
          <NavItem view={ViewState.AUDIT_LOG} icon={FileText} label="审计日志" />
          <NavItem view={ViewState.AGENT_CONFIG} icon={Cpu} label="本地代理" />
          <NavItem view={ViewState.ANALYTICS} icon={PieChart} label="安全效能" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl text-white shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
              </span>
              <span className="text-xs font-medium text-success-100">隐私保护引擎</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-400">CKKS 同态加密运行中</p>
              <p className="text-[10px] text-gray-400">信息熵: 0.96 (极致级)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm z-10">
          <div className="flex items-center lg:w-1/3">
            <button 
              className="p-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg mr-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-full max-w-xs transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100 border border-transparent focus-within:border-primary-200">
              <Search size={14} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="加密搜索..." 
                className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="hidden lg:flex items-center bg-success-50 border border-success-100 px-2.5 py-1 rounded-md">
              <ShieldCheck size={12} className="text-success-600 mr-1.5" />
              <span className="text-[11px] font-bold text-success-700 uppercase">安全 • 极致</span>
            </div>

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800 leading-none">王总监</p>
                <p className="text-[10px] text-gray-500 leading-none mt-1">研发中心</p>
              </div>
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="User" 
                className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"
              />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          <div className="w-full mx-auto h-full flex flex-col">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;