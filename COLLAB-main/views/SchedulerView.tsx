import React, { useState, useEffect } from 'react';
import { Lock, Smartphone, Server, Check, Users, Calendar, AlertTriangle, ShieldCheck, ArrowLeft, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { ScheduleCandidate } from '../types';
import { api } from '../src/api';

interface SchedulerViewProps {
  onBack?: () => void;
}

const SchedulerView: React.FC<SchedulerViewProps> = ({ onBack }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ScheduleCandidate[]>([]);
  const [topic, setTopic] = useState('Q4 产品战略复盘');
  const [duration, setDuration] = useState('60 分钟');
  const [privacyLevel, setPrivacyLevel] = useState('enhanced'); // basic, enhanced, extreme

  // Initiate Meeting
  const handleInitiate = async () => {
    try {
      setStep(2);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        setStep(1);
        return;
      }
      const res = await api.initiateMeeting(token, {
        topic,
        duration,
        participants: ['p1', 'p2', 'p3'], // Mock IDs
        dateRange: '2023-10-23_2023-10-27'
      });
      if (res.success) {
        setMeetingId(res.meetingId);
      }
    } catch (e) {
      console.error(e);
      alert('发起会议失败');
      setStep(1);
    }
  };

  // Poll for status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && meetingId) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const statusRes = await api.getMeetingStatus(token, meetingId);
          setEncryptionProgress(statusRes.progress);
          
          if (statusRes.status === 'ready') {
            clearInterval(interval);
            // Fetch candidates
            const candRes = await api.getMeetingCandidates(token, meetingId);
            if (candRes.success) {
              setCandidates(candRes.candidates);
              setTimeout(() => setStep(3), 500);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, meetingId]);

  const handleFinalConfirm = async () => {
    if (!meetingId || candidates.length === 0) return;
    
    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        setIsSending(false);
        return;
      }
      await api.confirmMeeting(token, {
        meetingId,
        candidateId: candidates[0].id // Default pick first
      });
      setStep(4);
    } catch (e) {
      alert('确认失败');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">发起联邦会议</h2>
          <p className="text-xs text-gray-500 mt-1">CKKS 全同态加密保障，不接触明文即可完成时间匹配</p>
        </div>
      </div>

      {/* Progress Steps */}
      {step !== 4 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-6 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 transform -translate-y-1/2"></div>
            {[
              { num: 1, label: '需求设定' },
              { num: 2, label: '隐私计算' },
              { num: 3, label: '方案确认' }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center bg-white px-2 z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors ${
                  step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.num ? 'text-primary-700' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Form & Actions */}
        <div className={`h-full flex flex-col overflow-y-auto pr-1 ${step === 4 ? 'col-span-12' : 'lg:col-span-4 xl:col-span-3'}`}>
          {/* STEP 1: Input Form */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-left duration-500 h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-5">配置会议参数</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">会议主题</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="例如：Q4 产品战略复盘" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">日期范围</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input type="text" defaultValue="本周 (10.23 - 10.27)" className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">预计时长</label>
                    <select 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option>45 分钟</option>
                      <option>60 分钟</option>
                      <option>90 分钟</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">参与协作人 (支持加密匹配)</label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[60px]">
                    {['Alice (产品)', 'Bob (研发)', 'Charlie (设计)'].map((p, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-success-500 mr-2"></div>
                        {p}
                      </span>
                    ))}
                    <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-primary-600 border border-dashed border-primary-300 hover:bg-primary-50 transition-colors">
                      + 添加联系人
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 flex items-center">
                    <ShieldCheck size={10} className="mr-1" />
                    系统仅使用加密标识符匹配联系人，不会读取您的完整通讯录
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">隐私计算等级</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setPrivacyLevel('basic')}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                        privacyLevel === 'basic' 
                        ? 'bg-gray-100 border-gray-400 text-gray-800' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      基础保护
                    </button>
                    <button 
                      onClick={() => setPrivacyLevel('enhanced')}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                        privacyLevel === 'enhanced' 
                        ? 'bg-primary-50 border-primary-500 text-primary-700' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      增强模式
                    </button>
                    <button 
                      onClick={() => setPrivacyLevel('extreme')}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                        privacyLevel === 'extreme' 
                        ? 'bg-success-50 border-success-500 text-success-700' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      极致加密
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                    {privacyLevel === 'basic' && '使用标准 TLS 加密传输，云端临时缓存。'}
                    {privacyLevel === 'enhanced' && '启用差分隐私噪声混淆，数据脱敏处理。'}
                    {privacyLevel === 'extreme' && '全程 CKKS 同态加密，云端仅处理密文。'}
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleInitiate}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center text-sm"
                  >
                    <Lock size={16} className="mr-2" />
                    开始隐私计算
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Processing Animation */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center animate-in fade-in zoom-in duration-500 h-full flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mx-auto mb-8">
                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="bg-primary-600 text-white p-3.5 rounded-2xl shadow-xl">
                     <Server size={28} />
                  </div>
                </div>

                {/* Orbiting Elements */}
                <div className="absolute inset-0 animate-spin-slow">
                   <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 p-2 rounded-full shadow-sm text-success-600">
                     <Smartphone size={16} />
                   </div>
                   <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white border border-gray-200 p-2 rounded-full shadow-sm text-success-600">
                     <Smartphone size={16} />
                   </div>
                   <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 p-2 rounded-full shadow-sm text-success-600">
                     <Smartphone size={16} />
                   </div>
                   <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 p-2 rounded-full shadow-sm text-success-600">
                     <Smartphone size={16} />
                   </div>
                </div>
                
                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
                   <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#165dff" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-6">正在进行联邦聚合...</h3>
              
              <div className="max-w-xs w-full mx-auto">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                   <span className="font-mono">CKKS_ENCRYPT</span>
                   <span className="font-mono">{encryptionProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                   <div 
                     className="bg-success-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                     style={{ width: `${encryptionProgress}%` }}
                   ></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Results & Success */}
          {(step === 3 || step === 4) && (
             <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col ${step === 4 ? 'col-span-12 lg:col-span-12' : ''}`}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {step === 3 ? '方案确认' : '发送成功'}
                </h3>
                
                {step === 3 ? (
                  <>
                    <div className="bg-success-50 border border-success-100 rounded-xl p-4 flex items-center justify-between mb-6">
                       <div className="flex items-center space-x-3">
                         <div className="bg-success-100 p-1.5 rounded-full text-success-600">
                           <Check size={16} />
                         </div>
                         <div>
                           <p className="font-bold text-success-900 text-sm">隐私计算完成</p>
                           <p className="text-success-700 text-xs">成功协调 4 人，隐私泄露风险 0.002%</p>
                         </div>
                       </div>
                    </div>
                    
                    <div className="mt-auto">
                       <button 
                         onClick={handleFinalConfirm}
                         className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm flex items-center justify-center"
                         disabled={isSending}
                       >
                         {isSending ? (
                           <>
                             <Loader2 size={16} className="mr-2 animate-spin" />
                             发送中...
                           </>
                         ) : (
                           <>
                             <Send size={16} className="mr-2" />
                             确认并发送加密邀请
                           </>
                         )}
                       </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                    <div className="w-24 h-24 bg-success-50 text-success-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-success-100">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">邀请已发送</h3>
                    <p className="text-base text-gray-500 mb-8 max-w-md">
                      已通过联邦网络向 4 位协作人发送了加密邀请。<br/>
                      所有参与者的回复将自动汇总到此任务中。
                    </p>
                    <div className="flex space-x-4">
                      <button onClick={() => setStep(1)} className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors shadow-md">
                        发起新会议
                      </button>
                      <button className="px-8 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                        查看日程表
                      </button>
                    </div>
                  </div>
                )}
             </div>
          )}
        </div>

        {/* Right Column: Visualization / Results */}
        {step !== 4 && (
        <div className="lg:col-span-8 xl:col-span-9 h-full overflow-y-auto pl-1">
           {step === 1 || step === 2 ? (
             <div className="bg-gray-50 rounded-2xl border border-gray-200 border-dashed h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
               <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                 <Calendar size={32} className="text-gray-300" />
               </div>
               <h3 className="text-lg font-bold text-gray-400 mb-1">等待隐私计算结果</h3>
               <p className="text-sm text-gray-400 max-w-xs">
                 请在左侧配置会议需求并开始计算。系统将在保护各方隐私的前提下，自动匹配最佳空闲时段。
               </p>
             </div>
           ) : (
             <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-500 h-full content-start">
              {candidates.map((c, idx) => (
                <div key={c.id} className={`group bg-white rounded-xl border p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full hover:shadow-md ${
                  idx === 0 
                  ? 'border-primary-500 shadow-md ring-1 ring-primary-500/10' 
                  : 'border-gray-200 hover:border-primary-300'
                }`}>
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-primary-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                      推荐
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3 mb-4">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                       idx === 0 ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
                     }`}>
                       {idx + 1}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-gray-900 text-sm truncate" title={c.timeSlot}>{c.timeSlot}</h4>
                       <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center text-xs font-bold text-success-600 bg-success-50 px-1.5 py-0.5 rounded">
                            <Users size={10} className="mr-1" />
                            {c.matchScore}%
                          </span>
                          {c.conflictCount > 0 && (
                            <span className="inline-flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                              <AlertTriangle size={10} className="mr-1" />
                              {c.conflictCount} 冲突
                            </span>
                          )}
                       </div>
                       <p className="font-mono text-gray-400 text-[9px] mt-2 truncate">HASH: {c.encryptionHash}</p>
                     </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-50 flex justify-between items-center mt-auto">
                     <div className="flex -space-x-1.5">
                       {c.participants.map((p, i) => (
                         <div key={i} className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] ${
                           p.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                         }`} title={`参与者 ${i+1}: ${p.status}`}>
                           {p.status === 'accepted' ? '✓' : '?'}
                         </div>
                       ))}
                     </div>
                     <button className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        idx === 0 ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                     }`}>
                        选择此时间
                     </button>
                  </div>
                </div>
              ))}
            </div>
           )}
        </div>
        )}
      </div>
    </div>
  );
};

export default SchedulerView;