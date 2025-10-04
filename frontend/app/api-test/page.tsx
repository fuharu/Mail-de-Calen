'use client';

import { useState } from 'react';
import { apiClient, ApiError } from '@/lib/api';

export default function ApiTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const result = await apiClient.healthCheck();
      addResult(`✅ Health Check: ${JSON.stringify(result)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        addResult(`❌ Health Check Error: ${error.message}`);
      } else {
        addResult(`❌ Health Check Error: ${error}`);
      }
    }
    setLoading(false);
  };

  const testAuthEndpoint = async () => {
    setLoading(true);
    try {
      const result = await fetch('http://localhost:8000/api/auth/me');
      const data = await result.json();
      addResult(`✅ Auth Endpoint: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`❌ Auth Endpoint Error: ${error}`);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">API テストページ</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">テスト実行</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={testHealthCheck}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '実行中...' : 'Health Check テスト'}
            </button>
            <button
              onClick={testAuthEndpoint}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? '実行中...' : 'Auth Endpoint テスト'}
            </button>
            <button
              onClick={clearResults}
              className="btn btn-outline"
            >
              結果をクリア
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">テストを実行してください</p>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">バックエンドサーバー情報</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• ヘルスチェック: <a href="http://localhost:8000/health" target="_blank" rel="noopener noreferrer" className="underline">http://localhost:8000/health</a></li>
            <li>• API ドキュメント: <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="underline">http://localhost:8000/docs</a></li>
            <li>• 認証エンドポイント: <a href="http://localhost:8000/api/auth/me" target="_blank" rel="noopener noreferrer" className="underline">http://localhost:8000/api/auth/me</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
