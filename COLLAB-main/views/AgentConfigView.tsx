
import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Shield, Zap, Send, MessageSquare, Clock, User, Bot, Network, Database, Lock, Activity, Save, CheckCircle2 } from 'lucide-react';
import { PrivacyLevel } from '../types';
import { api } from '../src/api';

interface Message {
  role: 'agent' | 'user';
  text: string;
  time: string;
}

const AgentConfigView: React.FC = () => {
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(PrivacyLevel.ENHANCED);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [loraParams, setLoraParams] = useState({ rank: 8, alpha: 16, dropout: 0.05 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock-token';
        const res = await api.getAgentConfig(token);
        if (res.success && res.config) {
          // Map config.privacyLevel string to enum if needed
          // setPrivacyLevel(res.config.privacyLevel);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchConfig();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'agent', 
      text: '您好！我是基于 Llama 3-8B 驱动的本地隐私代理。您可以直接告诉我您的协作偏好，我将通过 LoRA 技术在本地进行微调适配。',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = (input: string): string => {
    const text = input.toLowerCase();
    
    if (text.includes('技术') || text.includes('原理') || text.includes('tech')) {
      setShowTechDetails(true);
      return '已为您展开【技术详情面板】，您可以实时查看 LoRA 微调参数、差分隐私预算 (ε) 以及联邦学习梯度聚合状态。';
    }
    if (text.includes('早') || text.includes('上午') || text.includes('morning')) {
      return '收到。正在调整时间权重矩阵 W_time... 已将 [08:00-11:00] 设为“低意愿协作时段”。该偏好向量 V_pref 已通过 CKKS 加密存入本地数据库。';
    }
    if (text.includes('周五') || text.includes('friday')) {
      return '明白。LoRA 适配器已更新：周五下午将自动拒绝非紧急（P3级以下）的外部会议请求。模型参数更新量 Δθ 已本地缓存。';
    }
    if (text.includes('出差') || text.includes('酒店') || text.includes('飞机')) {
      return '已记录差旅偏好。正在更新联邦推荐模型：优先匹配“靠窗座位”与“高评分商务酒店”。知识蒸馏过程已启动，将从全局教师模型获取最新推荐策略。';
    }
    if (text.includes('拒绝') || text.includes('拦截') || text.includes('骚扰')) {
      return '安全策略已升级。Agent 将对所有未在信任名单中的应用请求执行“严格拦截”模式，并注入拉普拉斯噪声 (Laplace Noise) 以混淆追踪。';
    }
    if (text.includes('午休') || text.includes('吃饭') || text.includes('中午')) {
      return '好的，已为您锁定每日 [12:00-13:30] 为“勿扰模式”。该时段的协作请求将自动进入待处理队列。';
    }
    if (text.includes('谢谢') || text.includes('ok') || text.includes('好')) {
      return '不客气，随时为您服务。您的隐私数据始终由您掌控。';
    }
    
    return `已收到您的指令：“${input}”。正在将其转化为嵌入向量 (Embeddings) 并通过 LoRA 进行微调，Agent 会在后续协作中自动应用此逻辑。`;
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', text: chatInput, time: now };
    
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulate network/inference delay
    const delay = Math.random() * 1000 + 800; // 800ms - 1800ms

    setTimeout(() => {
      const responseText = generateResponse(userMsg.text);
      const agentMsg: Message = { 
        role: 'agent', 
        text: responseText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleSaveConfig = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const levels = [
    { id: PrivacyLevel.BASIC, label: '基础级', color: 'bg-gray-400', desc: '数据加密传输，云端短期缓存' },
    { id: PrivacyLevel.ENHANCED, label: '增强级', color: 'bg-primary-500', desc: '差分隐私脱敏，云端无持久存储' },
    { id: PrivacyLevel.EXTREME, label: '极致级', color: 'bg-success-500', desc: '全同态加密 (CKKS)，数据绝不出域' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] relative">
      {/* Toast Notification */}
      {showSaveToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-green-400 mr-2" />
          <span className="font-bold text-sm">配置已保存至本地、即时生效</span>
        </div>
      )}

      {/* Left Column: Settings */}
      <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Model Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-3">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                 <Cpu size={24} />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Meta execuTorch (本地版)</h3>
                 <p className="text-xs text-gray-500">v3.2.0 • 在 NPU 上运行</p>
               </div>
             </div>
             <div className="flex items-center space-x-2">
               <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
               <span className="text-sm font-medium text-success-600">在线</span>
             </div>
           </div>
           
           <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                 <div className="text-xs text-gray-500 mb-1">推理延迟</div>
                 <div className="font-mono font-bold text-gray-800">42ms</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                 <div className="text-xs text-gray-500 mb-1">存储占用</div>
                 <div className="font-mono font-bold text-gray-800">185MB</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                 <div className="text-xs text-gray-500 mb-1">今日拦截</div>
                 <div className="font-mono font-bold text-gray-800">14次</div>
              </div>
           </div>
        </div>

        {/* Privacy Level Slider */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
           <div className="flex items-center mb-6">
              <Shield className="text-primary-600 mr-2" size={20} />
              <h3 className="font-bold text-gray-900">隐私保护等级</h3>
           </div>

           <div className="space-y-4">
             <input 
               type="range" 
               min="0" 
               max="2" 
               step="1" 
               value={levels.findIndex(l => l.id === privacyLevel)}
               onChange={(e) => setPrivacyLevel(levels[parseInt(e.target.value)].id)}
               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
             />
             <div className="flex justify-between">
                {levels.map((l) => (
                  <div key={l.id} className={`flex flex-col items-center cursor-pointer transition-opacity ${l.id === privacyLevel ? 'opacity-100 scale-105' : 'opacity-50'}`} onClick={() => setPrivacyLevel(l.id)}>
                     <div className={`w-4 h-4 rounded-full mb-2 ${l.color}`}></div>
                     <span className="text-sm font-bold text-gray-800">{l.label}</span>
                  </div>
                ))}
             </div>
             
             <div className="mt-6 bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-start">
                <Shield className="text-primary-600 mt-1 mr-3 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-primary-900 text-sm">当前模式：{privacyLevel}</h4>
                  <p className="text-primary-700 text-xs mt-1">
                    {levels.find(l => l.id === privacyLevel)?.desc}。符合《个人信息保护法》最高合规标准。
                  </p>
                </div>
             </div>
           </div>
        </div>
        
        {/* LoRA Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="text-blue-600 mr-2" size={20} />
                <h3 className="font-bold text-gray-900">LoRA 微调参数</h3>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">可编辑</span>
           </div>
           
           <div className="grid grid-cols-3 gap-4 mb-4">
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">秩 (Rank)</label>
               <input 
                 type="number" 
                 value={loraParams.rank}
                 onChange={(e) => setLoraParams({...loraParams, rank: parseInt(e.target.value)})}
                 className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Alpha</label>
               <input 
                 type="number" 
                 value={loraParams.alpha}
                 onChange={(e) => setLoraParams({...loraParams, alpha: parseInt(e.target.value)})}
                 className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Dropout</label>
               <input 
                 type="number" 
                 step="0.01"
                 value={loraParams.dropout}
                 onChange={(e) => setLoraParams({...loraParams, dropout: parseFloat(e.target.value)})}
                 className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
               />
             </div>
           </div>
           
           <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed">
             调整参数将影响本地模型的适应性速率。建议保持默认值以获得最佳稳定性。
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
             <div>
               <h3 className="font-bold text-gray-900">模型轻量化优化</h3>
               <p className="text-xs text-gray-500">清理冗余参数，提升移动端响应速度</p>
             </div>
             <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <Zap size={16} className="mr-2" />
                立即优化
             </button>
          </div>

          <button 
            onClick={handleSaveConfig}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center"
          >
            <Save size={18} className="mr-2" />
            保存配置
          </button>
          
          {showTechDetails && (
            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
                <h3 className="font-bold flex items-center text-primary-300">
                  <Activity size={18} className="mr-2" />
                  实时技术监控
                </h3>
                <span className="text-[10px] bg-primary-900/50 px-2 py-1 rounded text-primary-300 border border-primary-800">开发者模式</span>
              </div>
              
              <div className="space-y-4 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">隐私预算 (ε):</span>
                  <span className="text-green-400">2.4/10.0</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '24%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">LoRA 秩 (r):</span>
                  <span className="text-blue-400">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Alpha 缩放:</span>
                  <span className="text-blue-400">16</span>
                </div>
                
                <div className="p-3 bg-black/30 rounded-lg mt-3 border border-gray-700">
                  <div className="flex items-center text-gray-400 mb-2">
                    <Network size={14} className="mr-2" />
                    <span>联邦聚合</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>轮次 #1,248</span>
                    <span className="text-yellow-500">同步中...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

      </div>

      {/* Right Column: Natural Language Interaction */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
         <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare size={18} className="text-primary-600 mr-2" />
              <span className="font-bold text-gray-800 text-sm">偏好训练对话</span>
            </div>
            <span className="text-[10px] bg-success-50 text-success-600 px-2 py-0.5 rounded-full font-medium border border-success-100">
              训练中
            </span>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                 <div className={`flex items-end max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                   {/* Avatar */}
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm ${
                     msg.role === 'user' ? 'bg-gray-800 text-white ml-2' : 'bg-primary-100 text-primary-600 mr-2'
                   }`}>
                     {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                   </div>

                   {/* Bubble */}
                   <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                     msg.role === 'user' 
                       ? 'bg-gray-900 text-white rounded-tr-none' 
                       : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
                 {/* Timestamp */}
                 <div className={`text-[10px] text-gray-400 mt-1 flex items-center ${
                   msg.role === 'user' ? 'mr-12' : 'ml-12'
                 }`}>
                   <Clock size={10} className="mr-1" />
                   {msg.time}
                 </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start">
                 <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mr-2 shadow-sm">
                   <Bot size={16} />
                 </div>
                 <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         <div className="p-4 border-t border-gray-100 bg-white">
            <div className="relative">
               <input 
                 type="text" 
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="告诉代理您的习惯，如'中午12点不要排会'..."
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all placeholder-gray-400"
               />
               <button 
                 onClick={handleSend}
                 disabled={!chatInput.trim() || isTyping}
                 className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${
                    !chatInput.trim() || isTyping
                    ? 'bg-gray-200 text-gray-400' 
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                 }`}
               >
                 <Send size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AgentConfigView;
