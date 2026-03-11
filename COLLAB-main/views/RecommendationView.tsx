import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, ThumbsUp, ThumbsDown, Loader2, Database, Share2, EyeOff, Target, Lock, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import { api } from '../src/api';

interface RecommendationViewProps {
  onBack: () => void;
}

const RecommendationView: React.FC<RecommendationViewProps> = ({ onBack }) => {
  const [step, setStep] = useState<'input' | 'loading' | 'results' | 'success'>('input');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // Input State
  const [scenario, setScenario] = useState('team_building');
  const [preference, setPreference] = useState('');

  const handleStartRecommendation = () => {
    if (!preference) {
      alert("请输入您的偏好需求");
      return;
    }
    setStep('loading');
    
    // Simulate API call delay
    setTimeout(() => {
      fetchRecs();
    }, 1500);
  };

  const fetchRecs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setStep('input');
        return;
      }
      const res = await api.getRecommendations(token);
      if (res.success) {
        setRecommendations(res.recommendations);
        setStep('results');
      }
    } catch (e) {
      console.error(e);
      setStep('input');
    }
  };

  const handleFeedback = (type: 'like' | 'dislike' | 'share') => {
    // In a real app, we would send feedback to the server here
    setStep('success');
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center mb-6 flex-shrink-0">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Sparkles className="text-purple-600 mr-2" size={20} />
            智能推荐
          </h2>
          <p className="text-xs text-gray-500 mt-1">基于联邦学习（Federated Learning）的隐私保护资源匹配</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: How it works */}
        {step !== 'success' && (
          <div className="lg:col-span-4 xl:col-span-3 h-full flex flex-col space-y-4 overflow-y-auto pr-1">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shrink-0">
               <h3 className="font-bold mb-2 text-sm uppercase tracking-wide opacity-90">核心原理</h3>
               <p className="text-sm leading-relaxed opacity-90 mb-4">
                 您的偏好数据（如采购意向、团建喜好）仅在本地模型中训练。我们仅聚合加密后的模型梯度，为您推荐最匹配的资源。
               </p>
               <div className="flex items-center space-x-2 text-xs bg-white/10 p-2 rounded-lg">
                 <EyeOff size={14} />
                 <span>服务器无法获知您的具体偏好</span>
               </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm shrink-0">
               <h4 className="font-bold text-gray-800 text-sm mb-3">模型状态</h4>
               <div className="space-y-3">
                 <div className="flex justify-between text-xs text-gray-500">
                   <span>本地样本数</span>
                   <span className="font-mono text-gray-800">1,240</span>
                 </div>
                 <div className="flex justify-between text-xs text-gray-500">
                   <span>联邦贡献度</span>
                   <span className="font-mono text-success-600">高</span>
                 </div>
                 <div className="flex justify-between text-xs text-gray-500">
                   <span>上次更新</span>
                   <span className="font-mono text-gray-800">10 分钟前</span>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Right: Content Area */}
        <div className={`${step === 'success' ? 'col-span-12' : 'lg:col-span-8 xl:col-span-9'} h-full overflow-y-auto pl-1`}>
          
          {/* STEP 1: Input */}
          {step === 'input' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 h-full flex flex-col justify-center max-w-2xl mx-auto">
               <div className="mb-8 text-center">
                 <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Target size={32} />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">告诉我您的需求</h3>
                 <p className="text-gray-500 mt-2">系统将在本地分析您的偏好，通过联邦网络匹配最佳资源</p>
               </div>

               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">协作场景</label>
                   <div className="grid grid-cols-3 gap-3">
                     <button 
                       onClick={() => setScenario('team_building')}
                       className={`p-3 rounded-xl border text-sm font-medium transition-all ${scenario === 'team_building' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'}`}
                     >
                       团队建设
                     </button>
                     <button 
                       onClick={() => setScenario('procurement')}
                       className={`p-3 rounded-xl border text-sm font-medium transition-all ${scenario === 'procurement' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'}`}
                     >
                       办公采购
                     </button>
                     <button 
                       onClick={() => setScenario('gift')}
                       className={`p-3 rounded-xl border text-sm font-medium transition-all ${scenario === 'gift' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'}`}
                     >
                       商务礼品
                     </button>
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">偏好描述</label>
                   <textarea 
                     value={preference}
                     onChange={(e) => setPreference(e.target.value)}
                     className="w-full border border-gray-300 rounded-xl p-4 h-32 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                     placeholder="例如：希望去户外活动，预算人均 500 元，不要太累..."
                   ></textarea>
                 </div>

                 <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                   <Lock size={14} className="mr-2 text-gray-400" />
                   您的输入仅在本地处理，不会上传云端
                 </div>

                 <button 
                   onClick={handleStartRecommendation}
                   className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${preference ? 'bg-gray-900 hover:bg-black' : 'bg-gray-300 cursor-not-allowed'}`}
                   disabled={!preference}
                 >
                   开始智能推荐
                   <ChevronRight size={18} className="ml-2" />
                 </button>
               </div>
            </div>
          )}

          {/* STEP 2: Loading */}
          {step === 'loading' && (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200">
              <Loader2 className="animate-spin text-purple-600 mb-3" size={32} />
              <p className="text-sm text-gray-500 font-medium">正在从联邦网络聚合推荐...</p>
              <p className="text-xs text-gray-400 mt-1">正在下载梯度更新</p>
            </div>
          )}

          {/* STEP 3: Results */}
          {step === 'results' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
              {recommendations.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col">
                   <div className="flex justify-between items-start flex-1">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{item.type}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{item.tag}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.reason}</p>
                      </div>
                      
                      <div className="text-center ml-auto shrink-0">
                         <div className="w-12 h-12 rounded-full border-2 border-purple-500 flex items-center justify-center text-sm font-bold text-purple-700">
                           {item.match}%
                         </div>
                         <p className="text-[10px] text-gray-400 mt-1">匹配度</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center space-x-4 pt-4 border-t border-gray-50 mt-auto">
                      <button onClick={() => handleFeedback('like')} className="flex items-center text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors">
                        <ThumbsUp size={16} className="mr-1.5" />
                        有用
                      </button>
                      <button onClick={() => handleFeedback('dislike')} className="flex items-center text-xs font-medium text-gray-500 hover:text-red-500 transition-colors">
                        <ThumbsDown size={16} className="mr-1.5" />
                        不感兴趣
                      </button>
                      <button onClick={() => handleFeedback('share')} className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors ml-auto">
                        <Share2 size={16} className="mr-1.5" />
                        分享
                      </button>
                   </div>
                </div>
              ))}
              <button className="col-span-full py-4 bg-gray-50 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors border border-dashed border-gray-300">
                 加载更多资源
              </button>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 'success' && (
             <div className="flex-1 flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-300 w-full">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center w-full max-w-5xl">
                  <div className="w-24 h-24 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-100 ring-8 ring-purple-50/50">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">推荐结果确认成功</h3>
                  <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
                    您的反馈数据已加密并用于本地模型更新。<br/>
                    联邦网络将根据您的偏好持续优化推荐算法。
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-6 mb-12">
                     <div className="flex items-center px-6 py-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                          <Database size={16} />
                        </div>
                        本地模型更新
                        <span className="ml-2 text-green-500 text-xs bg-green-50 px-2 py-0.5 rounded-full">已完成</span>
                     </div>
                     <div className="flex items-center px-6 py-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                          <MessageSquare size={16} />
                        </div>
                        偏好权重调整
                        <span className="ml-2 text-green-500 text-xs bg-green-50 px-2 py-0.5 rounded-full">已同步</span>
                     </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep('input')} className="px-10 py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-base">
                      发起新推荐
                    </button>
                    <button className="px-10 py-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-base">
                      查看更新日志
                    </button>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationView;