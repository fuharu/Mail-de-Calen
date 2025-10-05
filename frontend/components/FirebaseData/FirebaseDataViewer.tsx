'use client';

import { 
  useEventCandidates, 
  useTodoCandidates, 
  EventCandidate,
  TodoCandidate
} from '@/hooks/useFirestore';
import { useAuthContext } from '@/contexts/AuthContext';

export const FirebaseDataViewer = () => {
  const { user } = useAuthContext();
  
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
  
  // ユーザー一覧は削除

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Firebase Firestore データビューアー
      </h1>

      {/* イベント候補 */}
      <div className="bg-base-100 rounded-box shadow-md p-4">
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
            <div className="text-sm text-gray-500 mt-2">読み込み中...</div>
          </div>
        )}
        
        {eventsError && (
          <div className="alert alert-error">
            <span>エラー: {eventsError}</span>
          </div>
        )}
        
        {eventCandidates && eventCandidates.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            イベント候補がありません
          </div>
        )}
        
        {eventCandidates && eventCandidates.length > 0 && (
          <div className="space-y-3">
            {eventCandidates.map((candidate: EventCandidate) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{candidate.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      開始: {candidate.start} - 終了: {candidate.end}
                    </p>
                    {candidate.description && (
                      <p className="text-sm text-gray-500 mt-1">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ToDo候補 */}
      <div className="bg-base-100 rounded-box shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">ToDo候補</h2>
          <button 
            className="btn btn-sm btn-outline"
            onClick={refetchTodos}
            disabled={todosLoading}
          >
            {todosLoading ? '読み込み中...' : '更新'}
          </button>
        </div>
        
        {todosLoading && (
          <div className="text-center py-4">
            <span className="loading loading-spinner loading-md"></span>
            <div className="text-sm text-gray-500 mt-2">読み込み中...</div>
          </div>
        )}
        
        {todosError && (
          <div className="alert alert-error">
            <span>エラー: {todosError}</span>
          </div>
        )}
        
        {todoCandidates && todoCandidates.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            ToDo候補がありません
          </div>
        )}
        
        {todoCandidates && todoCandidates.length > 0 && (
          <div className="space-y-3">
            {todoCandidates.map((candidate: TodoCandidate) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={candidate.completed}
                        className="checkbox checkbox-sm"
                        readOnly
                      />
                      <h3 className="font-medium">{candidate.title}</h3>
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
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
