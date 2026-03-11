import React, { useState } from 'react';
import { ArrowLeft, Map, Calendar, Users, Lock, ChevronRight, Train, Plane, Hotel, Check, X, SlidersHorizontal, CheckCircle2, FileText, Shield } from 'lucide-react';
import { api } from '../src/api';

interface TravelViewProps {
  onBack: () => void;
}

const TravelView: React.FC<TravelViewProps> = ({ onBack }) => {
  const [step, setStep] = useState<'input' | 'searching' | 'results' | 'success'>('input');
  
  // State for selections
  const [destination, setDestination] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>(['我 (当前用户)']);
  const [budget, setBudget] = useState('5000');
  const [results, setResults] = useState<any[]>([]);
  
  // Modals state
  const [showDateModal, setShowDateModal] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);

  // Mock Data for 2026
  const dateOptions = [
    "2026年 1月15日 - 1月18日 (春节前)",
    "2026年 3月10日 - 3月12日 (Q1 商务)",
    "2026年 5月20日 - 5月25日 (行业展会)",
    "2026年 10月01日 - 10月07日 (国庆考察)"
  ];

  const mockContacts = [
    { id: '1', name: 'Alice (产品经理)', dept: '产品部' },
    { id: '2', name: 'Bob (技术总监)', dept: '研发中心' },
    { id: '3', name: 'Charlie (设计师)', dept: '设计部' },
    { id: '4', name: 'David (法务)', dept: '合规部' },
  ];

  const handleSearch = async () => {
    if (!destination || !selectedDateRange) {
      alert("请填写完整的目的地和时间");
      return;
    }
    setStep('searching');
    
    try {
      // Initiate search
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        setStep('input');
        return;
      }
      const initRes = await api.searchTravel(token, {
        destination,
        dateRange: selectedDateRange,
        companions: selectedCompanions,
        budget
      });

      if (initRes.success) {
        // Poll for results
        const poll = setInterval(async () => {
          const res = await api.getTravelResults(token, initRes.searchId);
          if (res.success) { // Found results
            clearInterval(poll);
            setResults(res.results);
            setStep('results');
          }
        }, 500);
      }
    } catch (e) {
      console.error(e);
      alert('搜索失败');
      setStep('input');
    }
  };

  const handleSelectPlan = () => {
    setStep('success');
  };

  const toggleCompanion = (name: string) => {
    if (selectedCompanions.includes(name)) {
      setSelectedCompanions(prev => prev.filter(c => c !== name));
    } else {
      setSelectedCompanions(prev => [...prev, name]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative space-y-6">
      {/* Modals Layer */}
      {showDateModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 animate-in zoom-in duration-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
              选择出行时间 (2026)
              <button onClick={() => setShowDateModal(false)}><X size={18} className="text-gray-400" /></button>
            </h4>
            <div className="space-y-2">
              {dateOptions.map((date) => (
                <button
                  key={date}
                  onClick={() => { setSelectedDateRange(date); setShowDateModal(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${selectedDateRange === date ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCompanionModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96 animate-in zoom-in duration-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
              添加同行人员
              <button onClick={() => setShowCompanionModal(false)}><X size={18} className="text-gray-400" /></button>
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockContacts.map((contact) => {
                 const fullName = `${contact.name}`;
                 const isSelected = selectedCompanions.includes(fullName);
                 return (
                  <button
                    key={contact.id}
                    onClick={() => toggleCompanion(fullName)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${isSelected ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className={`font-medium ${isSelected ? 'text-orange-700' : 'text-gray-900'}`}>{contact.name}</span>
                      <span className="text-xs text-gray-400">{contact.dept}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-orange-500" />}
                  </button>
                 )
              })}
            </div>
            <button 
              onClick={() => setShowCompanionModal(false)}
              className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-black"
            >
              确认 ({selectedCompanions.length} 人)
            </button>
          </div>
        </div>
      )}

      {/* Main View */}
      <div className="flex items-center flex-shrink-0">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Map className="text-orange-500 mr-2" size={20} />
            跨域行程
          </h2>
          <p className="text-xs text-gray-500 mt-1">基于隐私计算的联邦协作平台 (V1.0)</p>
        </div>
      </div>

      {/* Main View Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 xl:col-span-3 h-full flex flex-col overflow-y-auto pr-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {step === 'results' ? '调整行程需求' : '规划新行程 (2026年度)'}
            </h3>
            
            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">目的地</label>
                <div className="relative">
                  <Map className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                    placeholder="输入城市 (如: 北京, 上海)" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">时间范围</label>
                <div className="relative cursor-pointer" onClick={() => setShowDateModal(true)}>
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    readOnly
                    value={selectedDateRange}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer bg-white" 
                    placeholder="点击选择 2026 日期..." 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">同行人员 (加密邀请)</label>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {selectedCompanions.map((p, i) => (
                      <div key={i} className="flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100 animate-in zoom-in duration-200">
                        <Users size={14} className="mr-2" />
                        {p}
                        {p !== '我 (当前用户)' && (
                          <button onClick={() => toggleCompanion(p)} className="ml-2 hover:text-red-500">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                  ))}
                  <button 
                    onClick={() => setShowCompanionModal(true)}
                    className="flex items-center px-3 py-1.5 bg-white border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-orange-400 hover:text-orange-500 transition-colors"
                  >
                      + 添加同事/伙伴
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">预算范围 (每人)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-400 font-bold text-xs">¥</span>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                    placeholder="5000" 
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start mt-auto">
                <Lock className="text-gray-400 mt-1 mr-3 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">隐私保护模式：开启</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    您的具体行程细节（如酒店房型、具体车次）将对第三方平台脱敏，仅在本地解密展示。
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-auto">
              <button 
                onClick={handleSearch}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center ${
                  destination && selectedDateRange 
                  ? 'bg-gray-900 hover:bg-black text-white cursor-pointer' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!destination || !selectedDateRange}
              >
                {step === 'results' ? '重新联邦规划' : '开始联邦规划'}
                <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Map & Results */}
        <div className="lg:col-span-8 xl:col-span-9 h-full flex flex-col overflow-y-auto pl-1">
          {step === 'input' ? (
            <div className="bg-gray-100 rounded-2xl border border-gray-200 h-full min-h-[500px] relative overflow-hidden flex items-center justify-center group">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale group-hover:scale-105 transition-transform duration-1000"></div>
              <div className="relative z-10 text-center p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm max-w-sm border border-white/50">
                <Map size={48} className="mx-auto text-orange-400 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">等待行程规划</h3>
                <p className="text-sm text-gray-500">
                  请在左侧输入目的地和时间。系统将利用联邦学习算法，在保护隐私的前提下为您和同伴匹配最佳行程。
                </p>
              </div>
            </div>
          ) : step === 'searching' ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center h-full min-h-[500px]">
              <div className="w-20 h-20 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-8"></div>
              <h3 className="text-xl font-bold text-gray-900">正在生成最优行程...</h3>
              <p className="text-gray-500 mt-2">正在协调 {selectedCompanions.length} 人的空闲时间 • 聚合优惠资源</p>
            </div>
          ) : step === 'success' ? (
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center h-full min-h-[500px] text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">行程方案已确认</h3>
                <p className="text-base text-gray-500 mb-8 max-w-md mx-auto">
                  行程详情已加密存储至本地保险箱。<br/>
                  合规报告已自动生成并归档。
                </p>
                
                <div className="flex space-x-4 mb-8">
                   <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
                      <Lock size={14} className="mr-2 text-gray-400" />
                      本地加密存储
                   </div>
                   <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
                      <FileText size={14} className="mr-2 text-gray-400" />
                      合规报告生成
                   </div>
                </div>

                <div className="flex space-x-4">
                  <button onClick={() => setStep('input')} className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors shadow-md">
                    规划新行程
                  </button>
                  <button className="px-8 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                    查看合规报告
                  </button>
                </div>
             </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500 h-full overflow-y-auto">
              {/* Map Header */}
              <div className="bg-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden shrink-0">
                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">目的地</p>
                    <h2 className="text-3xl font-bold">{destination}</h2>
                    <p className="text-sm text-orange-100 mt-1 flex items-center">
                      <Calendar size={14} className="mr-1.5" />
                      {selectedDateRange.split('(')[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">2</p>
                    <p className="text-xs text-orange-200 uppercase">推荐方案</p>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                  <Plane size={120} />
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-2 overflow-x-auto pb-1">
                <button className="flex items-center px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-sm">
                  <SlidersHorizontal size={12} className="mr-1.5" />
                  综合排序
                </button>
                <button className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
                  价格最低
                </button>
                <button className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
                  耗时最短
                </button>
                <button className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
                  仅看高铁
                </button>
                <button className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
                  五星酒店
                </button>
              </div>

              {/* Results List */}
              <div className="grid gap-4 xl:grid-cols-2">
                {results.map((result: any) => (
                  <div key={result.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                      {result.tags && result.tags.includes('性价比推荐') && (
                        <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl z-10">性价比推荐</div>
                      )}
                      <div className="flex flex-col md:flex-row gap-6 mt-2">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 ${
                                result.type === 'train' ? 'bg-blue-50 text-blue-600' : 'bg-sky-50 text-sky-600'
                              }`}>
                                  {result.type === 'train' ? <Train size={20} /> : <Plane size={20} />}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{result.transport}</p>
                                <p className="text-xs text-gray-500">{result.transportTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 shrink-0">
                                  <Hotel size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{result.hotel}</p>
                                <p className="text-xs text-gray-500">{result.hotelDetails}</p>
                              </div>
                            </div>
                        </div>
                        <div className="md:border-l md:border-gray-100 md:pl-6 flex flex-col justify-center items-end md:items-start min-w-[140px]">
                            <p className="text-xs text-gray-400">预估总价</p>
                            <p className="text-2xl font-bold text-gray-900">¥ {result.price}</p>
                            <button 
                              onClick={handleSelectPlan}
                              className="mt-3 w-full py-2.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-900/20"
                            >
                              选择此方案
                            </button>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelView;