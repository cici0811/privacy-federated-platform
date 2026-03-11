import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, Legend } from 'recharts';
import { ShieldCheck, Lock, Unlock, ArrowRight, Zap, Activity } from 'lucide-react';
import { api, socketService } from '../src/api';

const AnalyticsView: React.FC = () => {
  // FL Visualization State
  const [trainingData, setTrainingData] = useState<{round: number, accuracy: number, loss: number}[]>([]);
  const [currentRound, setCurrentRound] = useState(0);

  // HE Demo State
  const [heInputA, setHeInputA] = useState(0);
  const [heInputB, setHeInputB] = useState(0);
  const [cipherA, setCipherA] = useState('');
  const [cipherB, setCipherB] = useState('');
  const [cipherSum, setCipherSum] = useState('');
  const [decryptedSum, setDecryptedSum] = useState<number | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [heError, setHeError] = useState<string | null>(null);

  // Setup WebSocket for FL Viz
  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('global-model-updated', (data: any) => {
      setCurrentRound(data.round);
      setTrainingData(prev => {
        const newData = [...prev, { 
          round: data.round, 
          accuracy: parseFloat(data.accuracy.toFixed(4)),
          loss: parseFloat((data.loss || 0).toFixed(4))
        }];
        return newData.slice(-20); // Keep last 20 points
      });
    });

    return () => {
      socket.off('global-model-updated');
    };
  }, []);

  // HE Demo Handlers
  const handleEncrypt = async () => {
    setIsComputing(true);
    setHeError(null);
    try {
      const token = localStorage.getItem('token') || 'demo-token';
      const resA = await api.encryptValue(token, Number(heInputA));
      const resB = await api.encryptValue(token, Number(heInputB));
      if (!resA?.success || !resB?.success) {
        setHeError(resA?.message || resB?.message || '加密失败');
        return;
      }
      setCipherA(resA.ciphertext || '');
      setCipherB(resB.ciphertext || '');
      setCipherSum('');
      setDecryptedSum(null);
    } catch (e: any) {
      setHeError(e?.message || '加密请求失败');
    } finally {
      setIsComputing(false);
    }
  };

  const handleComputeSum = async () => {
    setIsComputing(true);
    setHeError(null);
    try {
      const token = localStorage.getItem('token') || 'demo-token';
      if (!cipherA || !cipherB) {
        setHeError('请先完成加密上传，生成密文 A 和 B。');
        return;
      }
      const res = await api.computeSum(token, cipherA, cipherB);
      if (!res?.success) {
        setHeError(res?.message || '密文加法失败');
        return;
      }
      setCipherSum(res.resultCipher || '');
    } catch (e: any) {
      setHeError(e?.message || '密文加法请求失败');
    } finally {
      setIsComputing(false);
    }
  };

  const handleDecrypt = async () => {
    setIsComputing(true);
    setHeError(null);
    try {
      const token = localStorage.getItem('token') || 'demo-token';
      if (!cipherSum) {
        setHeError('请先执行密文加法，生成 Sum 密文。');
        return;
      }
      const res = await api.decryptValue(token, cipherSum);
      if (!res?.success) {
        setHeError(res?.message || '解密失败');
        return;
      }
      setDecryptedSum(typeof res.value === 'number' ? res.value : Number(res.value));
    } catch (e: any) {
      setHeError(e?.message || '解密请求失败');
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold text-gray-900">安全与效能分析</h2>
        <p className="text-gray-500">基于联邦学习框架的实时监控指标与密码学演示</p>
      </div>

      {/* 1. Federated Learning Visualization */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              联邦训练实时监控 (全局模型)
            </h3>
            <p className="text-sm text-gray-500">当前轮次: 第 {currentRound} 轮</p>
          </div>
          <div className="flex space-x-4">
            <span className="flex items-center text-xs text-gray-500">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> 准确率
            </span>
            <span className="flex items-center text-xs text-gray-500">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span> 损失值
            </span>
          </div>
        </div>
        
        <div className="h-64 w-full">
          {trainingData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }} />
                <YAxis yAxisId="left" domain={[0, 1]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-400">等待联邦节点上传梯度...</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Homomorphic Encryption Demo */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
        <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2" />
          同态加密演示 (CKKS)
        </h3>
        <p className="text-sm text-indigo-700 mb-6">
          演示如何在密文状态下进行加法运算，服务器全程无法获知原始数值。
        </p>

        {heError && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-4 mb-6">
            {heError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Step 1: Input */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Step 1: 本地输入 (明文)</h4>
              <div className="space-y-3">
                <input 
                  type="number" 
                  value={heInputA} 
                  onChange={(e) => setHeInputA(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="数值 A"
                />
                <input 
                  type="number" 
                  value={heInputB} 
                  onChange={(e) => setHeInputB(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="数值 B"
                />
                <button 
                  onClick={handleEncrypt}
                  disabled={isComputing}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex justify-center items-center"
                >
                  <Lock className="w-3 h-3 mr-1" /> {isComputing ? '加密中...' : '加密上传'}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Server Computation */}
          <div className="space-y-4 pt-8 md:pt-0 relative">
             <div className="hidden md:block absolute top-1/2 -left-4 transform -translate-y-1/2">
                <ArrowRight className="text-indigo-300 w-6 h-6" />
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Step 2: 云端计算 (密文)</h4>
              <div className="space-y-2 text-xs font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-hidden">
                <p className="truncate">A: {cipherA || '等待中...'}</p>
                <p className="truncate">B: {cipherB || '等待中...'}</p>
                <div className="border-t border-gray-700 my-2"></div>
                <p className="truncate text-yellow-400">Sum: {cipherSum || '???'}</p>
              </div>
              <button 
                  onClick={handleComputeSum}
                  disabled={!cipherA || isComputing}
                  className="w-full mt-3 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex justify-center items-center"
                >
                  <Zap className="w-3 h-3 mr-1" /> {isComputing ? '计算中...' : '执行密文加法'}
                </button>
            </div>
          </div>

          {/* Step 3: Decryption */}
          <div className="space-y-4 pt-8 md:pt-0 relative">
             <div className="hidden md:block absolute top-1/2 -left-4 transform -translate-y-1/2">
                <ArrowRight className="text-indigo-300 w-6 h-6" />
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Step 3: 本地解密 (结果)</h4>
              <div className="flex flex-col items-center justify-center h-32 bg-indigo-50 rounded-lg border border-dashed border-indigo-200 mb-3">
                {decryptedSum !== null ? (
                  <span className="text-3xl font-bold text-indigo-600">{decryptedSum}</span>
                ) : (
                  <span className="text-gray-400 text-sm">等待中...</span>
                )}
              </div>
              <button 
                  onClick={handleDecrypt}
                  disabled={!cipherSum || isComputing}
                  className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex justify-center items-center"
                >
                  <Unlock className="w-3 h-3 mr-1" /> {isComputing ? '解密中...' : '解密结果'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
