'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEventCandidates, useTodoCandidates } from '@/hooks/useFirestore';
import { useEmails } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';
import { getAuth } from 'firebase/auth';

export default function InboxPage() {
    const { user, loading: authLoading } = useAuthContext();
    const [activeTab, setActiveTab] = useState<'emails' | 'events' | 'todos' | 'history'>('emails');

    // 日付フォーマット関数
    const formatDate = (dateInput: string | any) => {
        if (!dateInput) return 'N/A';
        try {
            let date: Date;
            if (typeof dateInput === 'string') {
                date = new Date(dateInput);
            } else if (dateInput.toDate && typeof dateInput.toDate === 'function') {
                // Firestore Timestamp オブジェクト
                date = dateInput.toDate();
            } else {
                date = new Date(dateInput);
            }
            return date.toLocaleString('ja-JP');
        } catch (error) {
            return 'N/A';
        }
    };
    
    // Firestoreからデータを取得
    const { 
        data: eventCandidates, 
        loading: eventsLoading, 
        error: eventsError,
        refetch: refetchEvents
    } = useEventCandidates(user?.email || undefined);
    
    const { 
        data: todoCandidates, 
        loading: todosLoading, 
        error: todosError,
        refetch: refetchTodos
    } = useTodoCandidates(user?.email || undefined);
    
    // メールデータを手動で管理
    const [emailsData, setEmailsData] = useState<any>(null);
    const [emailsLoading, setEmailsLoading] = useState(false);
    const [emailsError, setEmailsError] = useState<string | null>(null);
    
    // メール取得関数
    const fetchEmails = async () => {
        try {
            setEmailsLoading(true);
            setEmailsError(null);
            const result = await apiClient.getRecentEmails(5);
            setEmailsData(result);
        } catch (error) {
            setEmailsError('メールの取得に失敗しました');
            console.error('メール取得エラー:', error);
        } finally {
            setEmailsLoading(false);
        }
    };

    // 解析履歴を取得（手動で管理）
    const [analysisHistoryData, setAnalysisHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    
    // 解析履歴の詳細表示
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
    const [showHistoryDetail, setShowHistoryDetail] = useState(false);
    
    // メールの詳細表示
    const [selectedEmail, setSelectedEmail] = useState<any>(null);
    const [showEmailDetail, setShowEmailDetail] = useState(false);

    const refetchHistory = async () => {
        try {
            setHistoryLoading(true);
            setHistoryError(null);
            const result = await apiClient.getAnalysisHistory(20);
            setAnalysisHistoryData(result.history || []);
        } catch (error) {
            setHistoryError('解析履歴の取得に失敗しました');
        } finally {
            setHistoryLoading(false);
        }
    };
    
    // 初期読み込み時に解析履歴を取得
    useEffect(() => {
        if (user) {
            refetchHistory();
        }
    }, [user]);

    // 解析履歴の詳細を表示
    const showHistoryDetailModal = (historyItem: any) => {
        setSelectedHistoryItem(historyItem);
        setShowHistoryDetail(true);
    };

    // 解析履歴の詳細を閉じる
    const closeHistoryDetailModal = () => {
        setSelectedHistoryItem(null);
        setShowHistoryDetail(false);
    };

    // メールの詳細を表示
    const showEmailDetailModal = (email: any) => {
        setSelectedEmail(email);
        setShowEmailDetail(true);
    };

    // メールの詳細を閉じる
    const closeEmailDetailModal = () => {
        setSelectedEmail(null);
        setShowEmailDetail(false);
    };

    // 解析状態管理
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    // 単一メール解析関数
    const handleAnalyzeEmail = async (emailId: string) => {
        try {
            setAnalyzing(true);
            setAnalysisResult(null);
            
            const result = await apiClient.analyzeEmail(emailId);
            setAnalysisResult(result);
            
            // データを再取得
            fetchEmails();
            refetchEvents(); // Firebaseからイベント候補を再取得
            refetchTodos(); // Firebaseからタスク候補を再取得
            refetchHistory();
            
        } catch (error) {
            console.error('メール解析エラー:', error);
            setAnalysisResult({ error: 'メール解析に失敗しました' });
        } finally {
            setAnalyzing(false);
        }
    };

    // 一括メール解析関数
    const handleAnalyzeRecentEmails = async (limit: number = 5) => {
        try {
            setAnalyzing(true);
            setAnalysisResult(null);
            
            // デバッグ: 認証トークンを確認
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('ユーザーがログインしていません');
            }
            
            const token = await currentUser.getIdToken();
            console.log('Firebase認証トークン:', token.substring(0, 50) + '...');
            
            const result = await apiClient.analyzeRecentEmails(limit);
            setAnalysisResult(result);
            
            // データを再取得
            fetchEmails();
            refetchEvents(); // Firebaseからイベント候補を再取得
            refetchTodos(); // Firebaseからタスク候補を再取得
            refetchHistory();
            
        } catch (error) {
            console.error('一括メール解析エラー:', error);
            setAnalysisResult({ error: `一括メール解析に失敗しました: ${error instanceof Error ? error.message : String(error)}` });
        } finally {
            setAnalyzing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "badge badge-sm";
        switch (status) {
            case 'pending':
                return `${baseClasses} badge-warning`;
            case 'approved':
                return `${baseClasses} badge-success`;
            case 'rejected':
                return `${baseClasses} badge-error`;
            default:
                return `${baseClasses} badge-neutral`;
        }
    };

    const handleApproveEvent = async (eventId: string) => {
        try {
            console.log('イベントを承認:', eventId);
            await apiClient.approveEvent(eventId);
            console.log('✅ イベント承認完了');
            // Firebaseからイベント候補を再取得
            await refetchEvents();
        } catch (error) {
            console.error('❌ イベント承認エラー:', error);
        }
    };

    const handleRejectEvent = async (eventId: string) => {
        try {
            console.log('イベントを却下:', eventId);
            await apiClient.rejectEvent(eventId);
            console.log('✅ イベント却下完了');
            // Firebaseからイベント候補を再取得
            await refetchEvents();
        } catch (error) {
            console.error('❌ イベント却下エラー:', error);
        }
    };

    const handleApproveTodo = async (todoId: string) => {
        try {
            console.log('ToDoを承認:', todoId);
            await apiClient.approveTodo(todoId);
            console.log('✅ ToDo承認完了');
            // Firebaseからタスク候補を再取得
            await refetchTodos();
        } catch (error) {
            console.error('❌ ToDo承認エラー:', error);
        }
    };

    const handleRejectTodo = async (todoId: string) => {
        try {
            console.log('ToDoを却下:', todoId);
            await apiClient.rejectTodo(todoId);
            console.log('✅ ToDo却下完了');
            // Firebaseからタスク候補を再取得
            await refetchTodos();
        } catch (error) {
            console.error('❌ ToDo却下エラー:', error);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <div className="text-lg mt-4">読み込み中...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <div className="text-lg mt-4">ログインページにリダイレクト中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Inbox</h1>

                {/* 解析結果表示 */}
                {analysisResult && (
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3">解析結果</h3>
                        {analysisResult.error ? (
                            <div className="text-red-600">{analysisResult.error}</div>
                        ) : (
                            <div className="space-y-2">
                                {analysisResult.success && (
                                    <div className="text-green-600">
                                        ✅ 解析が完了しました
                                    </div>
                                )}
                                {analysisResult.total_analyzed && (
                                    <div>
                                        解析したメール: {analysisResult.total_analyzed}件
                                    </div>
                                )}
                                {analysisResult.total_saved && (
                                    <div>
                                        保存したアイテム: {analysisResult.total_saved}件
                                    </div>
                                )}
                                {analysisResult.saved_items && (
                                    <div className="mt-3">
                                        <div className="text-sm text-gray-600">
                                            タスク: {analysisResult.saved_items.tasks?.length || 0}件
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            イベント: {analysisResult.saved_items.events?.length || 0}件
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 解析ボタンを削除 */}

                {/* タブナビゲーション */}
                <div className="tabs tabs-bordered mb-6">
                    <button
                        className={`tab ${activeTab === 'emails' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('emails')}
                    >
                        メール ({emailsData?.emails?.length || 0})
                    </button>
                    <button
                        className={`tab ${activeTab === 'events' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        イベント候補 ({eventCandidates?.length || 0})
                    </button>
                    <button
                        className={`tab ${activeTab === 'todos' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('todos')}
                    >
                        ToDo候補 ({todoCandidates?.length || 0})
                    </button>
                    <button
                        className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        解析履歴 ({analysisHistoryData?.length || 0})
                    </button>
                </div>

                {/* メールタブ */}
                {activeTab === 'emails' && (
                    <div className="bg-base-100 rounded-box shadow-md p-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">最近のメール</h2>
                        </div>
                        
                        {emailsLoading && (
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-md"></span>
                                <div className="text-sm text-gray-500 mt-2">メール読み込み中...</div>
                            </div>
                        )}
                        
                        {emailsError && (
                            <div className="alert alert-error">
                                <span>エラー: {emailsError}</span>
                            </div>
                        )}
                        
                        {!emailsData && !emailsLoading && !emailsError && (
                            <div className="text-center text-gray-500 py-8">
                                <p className="mb-4">メールを取得するには「メールを取得」ボタンをクリックしてください</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={fetchEmails}
                                >
                                    メールを取得
                                </button>
                            </div>
                        )}
                        
                        {emailsData?.emails?.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                メールがありません
                            </div>
                        )}
                        
                        {emailsData?.emails && emailsData.emails.length > 0 && (
                            <div className="space-y-3">
                                {emailsData.emails.map((email: any) => (
                                    <div key={email.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer w-full">
                                        <div className="flex justify-between items-start gap-4">
                                            <div 
                                                className="flex-1 min-w-0 overflow-hidden cursor-pointer"
                                                onClick={() => showEmailDetailModal(email)}
                                            >
                                                <h3 className="font-medium text-gray-800 hover:text-blue-600 break-words">{email.subject}</h3>
                                                <p className="text-sm text-gray-600 mt-1 break-words">
                                                    送信者: {email.sender}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    受信日時: {formatDate(email.date)}
                                                </p>
                                                {email.body && (
                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 break-words overflow-hidden">
                                                        {email.body.substring(0, 200)}...
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAnalyzeEmail(email.id);
                                                    }}
                                                    disabled={analyzing}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    {analyzing ? '解析中...' : '解析'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* イベント候補タブ */}
                {activeTab === 'events' && (
                    <div className="bg-base-100 rounded-box shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">イベント候補</h2>
                            <button 
                                className="btn btn-sm btn-outline"
                                onClick={refetchEvents}
                                disabled={eventsLoading}
                            >
                                {eventsLoading ? '読み込み中...' : '更新'}
                            </button>
                        </div>
                        
                        {eventsLoading && (
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-md"></span>
                                <div className="text-sm text-gray-500 mt-2">イベント読み込み中...</div>
                            </div>
                        )}
                        
                        {eventsError && (
                            <div className="alert alert-error">
                                <span>エラー: {eventsError}</span>
                            </div>
                        )}
                        
                        {eventCandidates?.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                イベント候補がありません
                            </div>
                        )}
                        
                        {eventCandidates && eventCandidates.length > 0 && (
                            <div className="space-y-4">
                                {eventCandidates.map((candidate: any) => (
                                    <div key={candidate.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-lg">{candidate.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    開始: {candidate.start} - 終了: {candidate.end}
                                                </p>
                                                {candidate.description && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {candidate.description}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    作成日時: {formatDate(candidate.created_at)}
                                                </p>
                                            </div>
                                            <span className={getStatusBadge(candidate.status)}>
                                                {candidate.status === 'pending' ? '保留中' : 
                                                 candidate.status === 'approved' ? '承認済み' : '却下'}
                                            </span>
                                        </div>
                                        
                                        {candidate.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveEvent(candidate.id)}
                                                    className="btn btn-sm btn-success"
                                                >
                                                    承認
                                                </button>
                                                <button
                                                    onClick={() => handleRejectEvent(candidate.id)}
                                                    className="btn btn-sm btn-error"
                                                >
                                                    却下
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ToDo候補タブ */}
                {activeTab === 'todos' && (
                    <div className="bg-base-100 rounded-box shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">ToDo候補</h2>
                            <button 
                                className="btn btn-sm btn-outline"
                                onClick={refetchEvents}
                                disabled={todosLoading}
                            >
                                {todosLoading ? '読み込み中...' : '更新'}
                            </button>
                        </div>
                        
                        {todosLoading && (
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-md"></span>
                                <div className="text-sm text-gray-500 mt-2">ToDo読み込み中...</div>
                            </div>
                        )}
                        
                        {todosError && (
                            <div className="alert alert-error">
                                <span>エラー: {todosError}</span>
                            </div>
                        )}
                        
                        {todoCandidates?.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                ToDo候補がありません
                            </div>
                        )}
                        
                        {todoCandidates && todoCandidates.length > 0 && (
                            <div className="space-y-4">
                                {todoCandidates.map((candidate: any) => (
                                    <div key={candidate.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={candidate.completed}
                                                        className="checkbox checkbox-sm"
                                                        readOnly
                                                    />
                                                    <h3 className="font-medium text-lg">{candidate.title}</h3>
                                                </div>
                                                {candidate.due_date && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        期限: {candidate.due_date}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    作成日時: {formatDate(candidate.created_at)}
                                                </p>
                                            </div>
                                            <span className={getStatusBadge(candidate.status)}>
                                                {candidate.status === 'pending' ? '保留中' : 
                                                 candidate.status === 'approved' ? '承認済み' : '却下'}
                                            </span>
                                        </div>
                                        
                                        {candidate.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveTodo(candidate.id)}
                                                    className="btn btn-sm btn-success"
                                                >
                                                    承認
                                                </button>
                                                <button
                                                    onClick={() => handleRejectTodo(candidate.id)}
                                                    className="btn btn-sm btn-error"
                                                >
                                                    却下
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 解析履歴タブ */}
                {activeTab === 'history' && (
                    <div className="bg-base-100 rounded-box shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">解析履歴</h2>
                            <button 
                                className="btn btn-sm btn-outline"
                                onClick={refetchHistory}
                                disabled={historyLoading}
                            >
                                {historyLoading ? '読み込み中...' : '更新'}
                            </button>
                        </div>

                        {historyLoading && (
                            <div className="text-center py-8">
                                <span className="loading loading-spinner loading-md"></span>
                                <div className="text-sm text-gray-500 mt-2">解析履歴を読み込み中...</div>
                            </div>
                        )}

                        {historyError && (
                            <div className="text-center text-red-500 py-8">
                                <span>エラー: {historyError}</span>
                            </div>
                        )}

                        {analysisHistoryData?.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                解析履歴がありません
                            </div>
                        )}

                        {analysisHistoryData && analysisHistoryData.length > 0 && (
                            <div className="space-y-3">
                                {analysisHistoryData.map((history: any) => (
                                    <div key={history.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div 
                                                className="flex-1 cursor-pointer"
                                                onClick={() => showHistoryDetailModal(history)}
                                            >
                                                <h3 className="font-medium text-gray-800 hover:text-blue-600">
                                                    {history.analysis_results?.[0]?.subject || '件名なし'}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    送信者: {history.analysis_results?.[0]?.sender || '送信者不明'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    解析日時: {history.timestamp ? formatDate(history.timestamp) : 'N/A'}
                                                </p>
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <span className="inline-block mr-4">
                                                        タスク: {history.todos_saved || 0}件
                                                    </span>
                                                    <span className="inline-block">
                                                        イベント: {history.events_saved || 0}件
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex gap-2">
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            // メモリ内の履歴から削除
                                                            const updatedHistory = analysisHistoryData.filter((h: any) => h.id !== history.id);
                                                            setAnalysisHistoryData(updatedHistory);
                                                        } catch (error) {
                                                            console.error('解析履歴の削除に失敗しました:', error);
                                                        }
                                                    }}
                                                    className="btn btn-sm btn-error"
                                                >
                                                    削除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 解析履歴の詳細モーダル */}
            {showHistoryDetail && selectedHistoryItem && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">解析履歴の詳細</h2>
                            <button
                                onClick={closeHistoryDetailModal}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-800 mb-2">メール情報</h3>
                                <div className="bg-gray-50 p-3 rounded">
                                    <p><strong>件名:</strong> {selectedHistoryItem.analysis_results?.[0]?.subject || 'N/A'}</p>
                                    <p><strong>送信者:</strong> {selectedHistoryItem.analysis_results?.[0]?.sender || 'N/A'}</p>
                                    <p><strong>解析日時:</strong> {selectedHistoryItem.timestamp ? formatDate(selectedHistoryItem.timestamp) : 'N/A'}</p>
                                    <p><strong>ステータス:</strong> 
                                        <span className={`ml-2 badge ${selectedHistoryItem.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                            {selectedHistoryItem.status === 'completed' ? '完了' : '処理中'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-800 mb-2">解析結果</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-3 rounded">
                                        <h4 className="font-medium text-blue-800">イベント</h4>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {selectedHistoryItem.analysis_results?.[0]?.analysis?.events?.length || 0}件
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded">
                                        <h4 className="font-medium text-green-800">タスク</h4>
                                        <p className="text-2xl font-bold text-green-600">
                                            {selectedHistoryItem.analysis_results?.[0]?.analysis?.tasks?.length || 0}件
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-800 mb-2">抽出されたアイテム</h3>
                                <div className="space-y-2">
                                    {/* 実際のGemini API解析結果を表示 */}
                                    {selectedHistoryItem.analysis_results?.[0]?.analysis?.events && 
                                     selectedHistoryItem.analysis_results[0].analysis.events.length > 0 && (
                                        <div className="bg-blue-50 p-3 rounded">
                                            <h4 className="font-medium text-blue-800 mb-2">イベント候補</h4>
                                            <ul className="text-sm text-blue-700">
                                                {selectedHistoryItem.analysis_results[0].analysis.events.map((event: any, index: number) => (
                                                    <li key={index}>
                                                        • {event.title}: {event.start ? new Date(event.start).toLocaleString('ja-JP') : '日時未定'}
                                                        {event.location && ` (${event.location})`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {selectedHistoryItem.analysis_results?.[0]?.analysis?.tasks && 
                                     selectedHistoryItem.analysis_results[0].analysis.tasks.length > 0 && (
                                        <div className="bg-green-50 p-3 rounded">
                                            <h4 className="font-medium text-green-800 mb-2">タスク候補</h4>
                                            <ul className="text-sm text-green-700">
                                                {selectedHistoryItem.analysis_results[0].analysis.tasks.map((task: any, index: number) => (
                                                    <li key={index}>
                                                        • {task.title}: {task.due_date ? new Date(task.due_date).toLocaleString('ja-JP') : '期限未定'}
                                                        {task.priority && ` (優先度: ${task.priority})`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {(!selectedHistoryItem.analysis_results?.[0]?.analysis?.events?.length && 
                                      !selectedHistoryItem.analysis_results?.[0]?.analysis?.tasks?.length) && (
                                        <div className="text-gray-500 text-center py-4">
                                            抽出されたアイテムがありません
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={closeHistoryDetailModal}
                                className="btn btn-outline"
                            >
                                閉じる
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        // メモリ内の履歴から削除
                                        const updatedHistory = analysisHistoryData.filter((h: any) => h.id !== selectedHistoryItem.id);
                                        setAnalysisHistoryData(updatedHistory);
                                        closeHistoryDetailModal();
                                    } catch (error) {
                                        console.error('解析履歴の削除に失敗しました:', error);
                                    }
                                }}
                                className="btn btn-error"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* メールの詳細モーダル */}
            {showEmailDetail && selectedEmail && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">メールの詳細</h2>
                            <button
                                onClick={closeEmailDetailModal}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-800 mb-2">メール情報</h3>
                                <div className="bg-gray-50 p-3 rounded">
                                    <p><strong>件名:</strong> {selectedEmail.subject}</p>
                                    <p><strong>送信者:</strong> {selectedEmail.sender}</p>
                                    <p><strong>受信日時:</strong> {formatDate(selectedEmail.date)}</p>
                                    <p><strong>メールID:</strong> {selectedEmail.id}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-800 mb-2">本文</h3>
                                <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                                        {selectedEmail.body || '本文がありません'}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={closeEmailDetailModal}
                                className="btn btn-outline"
                            >
                                閉じる
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAnalyzeEmail(selectedEmail.id);
                                    closeEmailDetailModal();
                                }}
                                disabled={analyzing}
                                className="btn btn-primary"
                            >
                                {analyzing ? '解析中...' : 'このメールを解析'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
