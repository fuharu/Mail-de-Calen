'use client';

import { useEvents, useTodos, useEventCandidates, useTodoCandidates } from "@/hooks/useFirestore";
import { useAuthContext } from "@/contexts/AuthContext";

interface SelectedDayContentProps {
    selectedDate: Date | null;
}

export const SelectedDayContent = ({ selectedDate }: SelectedDayContentProps) => {
    const { user } = useAuthContext();
    const { data: eventsData, loading: eventsLoading, error: eventsError } = useEvents(user?.email || undefined);
    const { data: todosData, loading: todosLoading, error: todosError } = useTodos(user?.email || undefined);
    
    // Firestoreから候補データを取得
    const { data: eventCandidates } = useEventCandidates(user?.email || undefined);
    const { data: todoCandidates } = useTodoCandidates(user?.email || undefined);

    if (!selectedDate) {
        return (
            <div className="lg:grid lg:grid-cols-2 gap-6 px-5">
                <div className="bg-base-100 rounded-box shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-4">今日のタスク</h2>
                    <div className="text-center text-gray-500 py-4">
                        日付を選択してください
                    </div>
                </div>
                <div className="bg-base-100 rounded-box shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-4">今日の予定</h2>
                    <div className="text-center text-gray-500 py-4">
                        日付を選択してください
                    </div>
                </div>
            </div>
        );
    }

    const selectedDateString = selectedDate.toDateString();
    
    // その日のイベントをフィルタ
    const dayEvents = eventsData?.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === selectedDateString;
    }) || [];

    // その日のToDoをフィルタ（期限がその日のもの）
    const dayTodos = todosData?.filter(todo => {
        if (!todo.due_date) return false;
        const dueDate = new Date(todo.due_date);
        return dueDate.toDateString() === selectedDateString;
    }) || [];

    // その日のイベント候補をフィルタ
    const dayEventCandidates = eventCandidates?.filter(candidate => {
        const candidateDate = new Date(candidate.start);
        return candidateDate.toDateString() === selectedDateString && candidate.status === 'pending';
    }) || [];

    // その日のToDo候補をフィルタ
    const dayTodoCandidates = todoCandidates?.filter(candidate => {
        if (!candidate.due_date) return false;
        const candidateDate = new Date(candidate.due_date);
        return candidateDate.toDateString() === selectedDateString && candidate.status === 'pending';
    }) || [];

    return (
        <div className="lg:grid lg:grid-cols-2 gap-6 px-5">
            {/* その日のタスク */}
            <div className="bg-base-100 rounded-box shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">
                    {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日のタスク
                </h2>
                
                {todosLoading && (
                    <div className="text-center py-4">
                        <span className="loading loading-spinner loading-sm"></span>
                        <div className="text-xs text-gray-500 mt-2">読み込み中...</div>
                    </div>
                )}
                
                {todosError && (
                    <div className="text-center text-red-500 text-sm">
                        エラー: {todosError}
                    </div>
                )}
                
                {!todosLoading && !todosError && dayTodos.length === 0 && dayTodoCandidates.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                        タスクがありません
                    </div>
                )}
                
                {!todosLoading && !todosError && (dayTodos.length > 0 || dayTodoCandidates.length > 0) && (
                    <div className="space-y-3">
                        {/* 承認済みToDo */}
                        {dayTodos.map((todo) => (
                            <div key={todo.id} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    className="checkbox checkbox-sm"
                                    readOnly
                                />
                                <div className="flex-1">
                                    <div className="font-medium">{todo.title}</div>
                                    {todo.due_date && (
                                        <div className="text-xs text-gray-500">
                                            期限: {new Date(todo.due_date).toLocaleDateString('ja-JP')}
                                        </div>
                                    )}
                                </div>
                                <span className="badge badge-sm badge-success">承認済み</span>
                            </div>
                        ))}
                        
                        {/* 候補ToDo */}
                        {dayTodoCandidates.map((candidate) => (
                            <div key={candidate.id} className="flex items-center gap-3 p-2 border border-yellow-200 rounded-lg bg-yellow-50">
                                <input
                                    type="checkbox"
                                    checked={candidate.completed}
                                    className="checkbox checkbox-sm"
                                    readOnly
                                />
                                <div className="flex-1">
                                    <div className="font-medium">{candidate.title}</div>
                                    {candidate.due_date && (
                                        <div className="text-xs text-gray-500">
                                            期限: {new Date(candidate.due_date).toLocaleDateString('ja-JP')}
                                        </div>
                                    )}
                                </div>
                                <span className="badge badge-sm badge-warning">候補</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* その日の予定 */}
            <div className="bg-base-100 rounded-box shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">
                    {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日の予定
                </h2>
                
                {eventsLoading && (
                    <div className="text-center py-4">
                        <span className="loading loading-spinner loading-sm"></span>
                        <div className="text-xs text-gray-500 mt-2">読み込み中...</div>
                    </div>
                )}
                
                {eventsError && (
                    <div className="text-center text-red-500 text-sm">
                        エラー: {eventsError}
                    </div>
                )}
                
                {!eventsLoading && !eventsError && dayEvents.length === 0 && dayEventCandidates.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                        予定がありません
                    </div>
                )}
                
                {!eventsLoading && !eventsError && (dayEvents.length > 0 || dayEventCandidates.length > 0) && (
                    <div className="space-y-3">
                        {/* 承認済みイベント */}
                        {dayEvents.map((event) => (
                            <div key={event.id} className="p-3 border border-gray-200 rounded-lg">
                                <div className="font-medium">{event.title}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {new Date(event.start).toLocaleTimeString('ja-JP', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })} - {new Date(event.end).toLocaleTimeString('ja-JP', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </div>
                                {event.description && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {event.description}
                                    </div>
                                )}
                                <span className="badge badge-sm badge-success mt-2">承認済み</span>
                            </div>
                        ))}
                        
                        {/* 候補イベント */}
                        {dayEventCandidates.map((candidate) => (
                            <div key={candidate.id} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                                <div className="font-medium">{candidate.title}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {new Date(candidate.start).toLocaleTimeString('ja-JP', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })} - {new Date(candidate.end).toLocaleTimeString('ja-JP', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </div>
                                {candidate.description && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {candidate.description}
                                    </div>
                                )}
                                <span className="badge badge-sm badge-warning mt-2">候補</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
