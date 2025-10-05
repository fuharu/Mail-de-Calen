'use client';

import { useState } from 'react';
import { useEvents, useTodos } from "@/hooks/useFirestore";
import { useAuthContext } from "@/contexts/AuthContext";

interface AllCalendarProps {
    onDateSelect?: (date: Date | null) => void;
}

export const AllCalendar = ({ onDateSelect }: AllCalendarProps) => {
    const { user } = useAuthContext();
    const { data: eventsData, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents(user?.email || undefined);
    const { data: todosData, loading: todosLoading, error: todosError, refetch: refetchTodos } = useTodos(user?.email || undefined);
    
    const events = eventsData || [];
    const todos = todosData || [];
    
    // デバッグ用ログ
    console.log('📅 カレンダーデータ:', { events: events.length, todos: todos.length });
    console.log('📅 イベントデータ:', events);
    console.log('📅 タスクデータ:', todos);
    
    const loading = eventsLoading || todosLoading;
    const error = eventsError || todosError;
    const refetch = () => {
        refetchEvents();
        refetchTodos();
    };
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState<{
        date: Date;
        events: any[];
        todos: any[];
    } | null>(null);

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = [
        "1月", "2月", "3月", "4月", "5月", "6月",
        "7月", "8月", "9月", "10月", "11月", "12月"
    ];
    
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
        onDateSelect?.(today);
    };

    const handleDateClick = (date: number) => {
        const clickedDate = new Date(year, month, date);
        setSelectedDate(clickedDate);
        onDateSelect?.(clickedDate);
        
        // その日の予定とタスクを取得
        const dayEvents = events.filter(event => {
            if (!event.start) return false;
            try {
                const eventDate = new Date(event.start);
                return eventDate.toDateString() === clickedDate.toDateString();
            } catch (error) {
                console.error('イベント日付解析エラー:', error, event);
                return false;
            }
        });
        
        const dayTodos = todos.filter(todo => {
            if (!todo.due_date) return false;
            try {
                const todoDate = new Date(todo.due_date);
                return todoDate.toDateString() === clickedDate.toDateString();
            } catch (error) {
                console.error('タスク日付解析エラー:', error, todo);
                return false;
            }
        });
        
        // ポップアップを表示
        setPopupData({
            date: clickedDate,
            events: dayEvents,
            todos: dayTodos
        });
        setShowPopup(true);
    };

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // カレンダーの開始日（月の最初の日の前の日曜日）
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    // カレンダーの終了日（月の最後の日の後の土曜日）
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));
    
    // カレンダーの日付配列を生成
    interface CalendarDay {
        date: Date;
        events: any[];
        todos: any[];
        eventCount: number;
        todoCount: number;
        isCurrentMonth: boolean;
        isToday: boolean;
        isSelected: boolean;
    }

    const calendarDays: CalendarDay[] = [];
    const currentDateForLoop = new Date(startDate);
    
    while (currentDateForLoop <= endDate) {
        // 10月30日を特別にデバッグ
        if (currentDateForLoop.getDate() === 30 && currentDateForLoop.getMonth() === 9) { // 10月は9（0ベース）
            console.log('🔍 10月30日のデバッグ:', {
                currentDate: currentDateForLoop.toDateString(),
                currentDateISO: currentDateForLoop.toISOString(),
                todos: todos.map(todo => ({
                    title: todo.title,
                    due_date: todo.due_date,
                    due_date_parsed: todo.due_date ? new Date(todo.due_date).toDateString() : 'N/A'
                }))
            });
        }
        
        const dayEvents = events.filter(event => {
            if (!event.start) return false;
            try {
                const eventDate = new Date(event.start);
                const isMatch = eventDate.toDateString() === currentDateForLoop.toDateString();
                if (isMatch) {
                    console.log('🎯 マッチしたイベント:', { event, eventDate, currentDate: currentDateForLoop.toDateString() });
                }
                return isMatch;
            } catch (error) {
                console.error('イベント日付解析エラー:', error, event);
                return false;
            }
        });
        
        const dayTodos = todos.filter(todo => {
            if (!todo.due_date) return false;
            try {
                const todoDate = new Date(todo.due_date);
                const isMatch = todoDate.toDateString() === currentDateForLoop.toDateString();
                if (isMatch) {
                    console.log('🎯 マッチしたタスク:', { todo, todoDate, currentDate: currentDateForLoop.toDateString() });
                }
                return isMatch;
            } catch (error) {
                console.error('タスク日付解析エラー:', error, todo);
                return false;
            }
        });
        
        calendarDays.push({
            date: new Date(currentDateForLoop),
            events: dayEvents,
            todos: dayTodos,
            eventCount: dayEvents.length,
            todoCount: dayTodos.length,
            isCurrentMonth: currentDateForLoop.getMonth() === month,
            isToday: currentDateForLoop.toDateString() === today.toDateString(),
            isSelected: selectedDate ? currentDateForLoop.toDateString() === selectedDate.toDateString() : false
        });
        
        currentDateForLoop.setDate(currentDateForLoop.getDate() + 1);
    }

    if (loading) {
        return (
            <div className="p-6 bg-base-100 rounded-box shadow-md m-5">
                <div className="text-center">
                    <span className="loading loading-spinner loading-md"></span>
                    <div className="text-sm text-gray-500 mt-2">カレンダー読み込み中...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-base-100 rounded-box shadow-md m-5">
                <div className="text-center text-red-500">
                    <div className="text-sm">エラー: {error}</div>
                    <button 
                        className="btn btn-sm btn-outline mt-2"
                        onClick={refetch}
                    >
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-base-100 rounded-box shadow-md m-5">
            {/* カレンダーヘッダー */}
            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={goToPreviousMonth}
                    className="btn btn-sm btn-outline"
                >
                    ←
                </button>
                
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {year}年{monthNames[month]}
                    </h2>
                    <button 
                        onClick={goToToday}
                        className="btn btn-xs btn-outline mt-1"
                    >
                        今日
                    </button>
                </div>
                
                <button 
                    onClick={goToNextMonth}
                    className="btn btn-sm btn-outline"
                >
                    →
                </button>
            </div>


            {/* カレンダーグリッド */}
            <table className="table-auto w-full text-center text-sm font-medium text-gray-800 bg-white">
                <thead>
                    <tr className="border-b border-gray-200">
                        {dayNames.map((day, index) => (
                            <th 
                                key={index} 
                                className={`py-2 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}`}
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                        <tr key={weekIndex} className="hover:bg-gray-50">
                            {Array.from({ length: 7 }, (_, dayIndex) => {
                                const dayData = calendarDays[weekIndex * 7 + dayIndex];
                                if (!dayData) return <td key={dayIndex} className="h-12 w-12"></td>;
                                
                                const { date, events, todos, eventCount, todoCount, isCurrentMonth, isToday, isSelected } = dayData;
                                
                                return (
                                    <td 
                                        key={dayIndex} 
                                        className={`h-12 w-12 border border-gray-200 cursor-pointer ${
                                            !isCurrentMonth ? 'text-gray-400' : 
                                            isSelected ? 'bg-yellow-200' :
                                            isToday ? 'text-black font-bold' :
                                            date.getDay() === 0 ? 'text-red-500' :
                                            date.getDay() === 6 ? 'text-blue-500' : 
                                            'text-gray-800'
                                        }`}
                                        onClick={() => handleDateClick(date.getDate())}
                                    >
                                        <div className="text-xs">{date.getDate()}</div>
                                        <div className="flex justify-center gap-1 mt-1">
                                            {eventCount > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-xs text-blue-500 font-bold">{eventCount}</span>
                                                </div>
                                            )}
                                            {todoCount > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                    <span className="text-xs text-orange-500 font-bold">{todoCount}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* 凡例 */}
            <div className="mt-4 text-center text-sm text-gray-600">
                <p className="mb-2">日付を押すと詳細が表示されます</p>
                <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>予定</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>タスク</span>
                    </div>
                </div>
            </div>
            
            {events.length === 0 && todos.length === 0 && (
                <div className="text-center text-gray-500 mt-4">
                    今月の予定・タスクがありません
                </div>
            )}
            
            {/* 日付詳細ポップアップ */}
            {showPopup && popupData && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {popupData.date.getFullYear()}年{popupData.date.getMonth() + 1}月{popupData.date.getDate()}日
                            </h2>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* 予定セクション */}
                            <div>
                                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    予定 ({popupData.events.length}件)
                                </h3>
                                {popupData.events.length > 0 ? (
                                    <div className="space-y-2">
                                        {popupData.events.map((event, index) => (
                                            <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                                                <h4 className="font-medium text-blue-900">{event.title}</h4>
                                                {event.description && (
                                                    <p className="text-sm text-blue-700 mt-1">{event.description}</p>
                                                )}
                                                {event.start && event.end && (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        時間: {new Date(event.start).toLocaleTimeString('ja-JP', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })} - {new Date(event.end).toLocaleTimeString('ja-JP', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </p>
                                                )}
                                                {event.location && (
                                                    <p className="text-xs text-blue-600">場所: {event.location}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">予定はありません</p>
                                )}
                            </div>
                            
                            {/* タスクセクション */}
                            <div>
                                <h3 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    タスク ({popupData.todos.length}件)
                                </h3>
                                {popupData.todos.length > 0 ? (
                                    <div className="space-y-2">
                                        {popupData.todos.map((todo, index) => (
                                            <div key={index} className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                                                <h4 className="font-medium text-orange-900">{todo.title}</h4>
                                                {todo.description && (
                                                    <p className="text-sm text-orange-700 mt-1">{todo.description}</p>
                                                )}
                                                {todo.due_date && (
                                                    <p className="text-xs text-orange-600 mt-1">
                                                        期限: {new Date(todo.due_date).toLocaleString('ja-JP')}
                                                    </p>
                                                )}
                                                <p className="text-xs text-orange-600">
                                                    優先度: {todo.priority || '未設定'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">タスクはありません</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="btn btn-outline"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
