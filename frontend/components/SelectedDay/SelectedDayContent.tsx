"use client";

import { useEvents, useTodos } from "@/hooks/useApi";
import { apiClient } from "@/lib/api";
import { useEffect, useState } from "react";

interface SelectedDayContentProps {
    selectedDate: Date | null;
    onClose?: () => void;
    onDataChange?: () => void;
}

export const SelectedDayContent = ({
    selectedDate,
    onClose,
    onDataChange,
}: SelectedDayContentProps) => {
    const {
        data: eventsData,
        loading: eventsLoading,
        error: eventsError,
        refetch: refetchEvents,
    } = useEvents();
    
    const {
        data: todosData,
        loading: todosLoading,
        error: todosError,
        refetch: refetchTodos,
    } = useTodos();

    // 編集状態の管理
    const [editingTodo, setEditingTodo] = useState<string | null>(null);
    const [editingEvent, setEditingEvent] = useState<string | null>(null);
    const [editingMemo, setEditingMemo] = useState<string>("");
    const [editingDescription, setEditingDescription] = useState<string>("");
    const [editingDueDate, setEditingDueDate] = useState<string>("");
    const [editingStartTime, setEditingStartTime] = useState<string>("");
    const [editingEndTime, setEditingEndTime] = useState<string>("");
    const [editMode, setEditMode] = useState<'memo' | 'dueDate' | 'description' | 'time' | null>(null);

    // ESCキーでモーダルを閉じる
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && selectedDate) {
                onClose?.();
            }
        };

        if (selectedDate) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedDate, onClose]);

    // モーダルが閉じられたときにチェックボックスを無効にする
    useEffect(() => {
        if (!selectedDate) {
            const modalCheckbox = document.getElementById('my_modal_7') as HTMLInputElement;
            if (modalCheckbox) {
                modalCheckbox.checked = false;
            }
        }
    }, [selectedDate]);

    // タスクの完了状態を切り替え
    const handleToggleTodoCompletion = async (todoId: string) => {
        try {
            await apiClient.toggleTodoCompletion(todoId);
            refetchTodos();
            onDataChange?.();
        } catch (error) {
            console.error("タスクの完了状態切り替えに失敗しました:", error);
        }
    };

    // 予定の完了状態を切り替え
    const handleToggleEventCompletion = async (eventId: string) => {
        try {
            await apiClient.toggleEventCompletion(eventId);
            refetchEvents();
            onDataChange?.();
        } catch (error) {
            console.error("予定の完了状態切り替えに失敗しました:", error);
        }
    };

    // タスクのメモ編集を開始
    const handleStartEditTodoMemo = (todo: any) => {
        setEditingTodo(todo.id);
        setEditingMemo(todo.memo || "");
        setEditMode('memo');
    };

    // タスクの期限編集を開始
    const handleStartEditTodoDueDate = (todo: any) => {
        setEditingTodo(todo.id);
        if (todo.due_date) {
            const utcDate = new Date(todo.due_date + 'Z');
            const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
            setEditingDueDate(localDate.toISOString().slice(0, 10));
        } else {
            setEditingDueDate("");
        }
        setEditMode('dueDate');
    };

    // 予定のメモ編集を開始
    const handleStartEditEventDescription = (event: any) => {
        setEditingEvent(event.id);
        setEditingDescription(event.description || "");
        setEditMode('description');
    };

    // 予定の時間編集を開始
    const handleStartEditEventTime = (event: any) => {
        setEditingEvent(event.id);
        // バックエンドから送られてくるUTC時間をそのまま編集フォームに設定
        const startUtc = new Date(event.start);
        const endUtc = new Date(event.end);
        
        setEditingStartTime(startUtc.toISOString().slice(0, 16));
        setEditingEndTime(endUtc.toISOString().slice(0, 16));
        setEditMode('time');
    };

    // タスクのメモ編集を保存
    const handleSaveTodoMemo = async (todoId: string) => {
        try {
            const todo = todosData?.todos?.find(t => t.id === parseInt(todoId));
            if (todo) {
                await apiClient.updateTodo(todoId, {
                    ...todo,
                    memo: editingMemo
                });
                setEditingTodo(null);
                setEditingMemo("");
                setEditMode(null);
                refetchTodos();
                onDataChange?.();
            }
        } catch (error) {
            console.error("メモの保存に失敗しました:", error);
        }
    };

    // タスクの期限編集を保存
    const handleSaveTodoDueDate = async (todoId: string) => {
        try {
            const todo = todosData?.todos?.find(t => t.id === parseInt(todoId));
            if (todo) {
                let dueDate = null;
                if (editingDueDate) {
                    const [year, month, day] = editingDueDate.split('-');
                    dueDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0)).toISOString();
                }
                await apiClient.updateTodo(todoId, {
                    ...todo,
                    due_date: dueDate
                });
                setEditingTodo(null);
                setEditingDueDate("");
                setEditMode(null);
                refetchTodos();
                onDataChange?.();
            }
        } catch (error) {
            console.error("期限の保存に失敗しました:", error);
        }
    };

    // 予定のメモ編集を保存
    const handleSaveEventDescription = async (eventId: string) => {
        try {
            const event = eventsData?.events?.find(e => e.id === parseInt(eventId));
            if (event) {
                await apiClient.updateEvent(eventId, {
                    ...event,
                    description: editingDescription
                });
                setEditingEvent(null);
                setEditingDescription("");
                setEditMode(null);
                refetchEvents();
                onDataChange?.();
            }
        } catch (error) {
            console.error("メモの保存に失敗しました:", error);
        }
    };

    // 予定の時間編集を保存
    const handleSaveEventTime = async (eventId: string) => {
        try {
            // 時間の妥当性チェック
            const startTime = new Date(editingStartTime);
            const endTime = new Date(editingEndTime);
            
            if (startTime >= endTime) {
                alert("開始時間は終了時間より前である必要があります。");
                return;
            }
            
            const event = eventsData?.events?.find(e => e.id === parseInt(eventId));
            if (event) {
                // 編集された時間（9時間前）に9時間を足してUTC時間として保存
                const startTimePlus9h = new Date(startTime.getTime() + 9 * 60 * 60 * 1000);
                const endTimePlus9h = new Date(endTime.getTime() + 9 * 60 * 60 * 1000);
                const startTimeUTC = startTimePlus9h.toISOString();
                const endTimeUTC = endTimePlus9h.toISOString();
                await apiClient.updateEvent(eventId, {
                    ...event,
                    start: startTimeUTC,
                    end: endTimeUTC
                });
                setEditingEvent(null);
                setEditingStartTime("");
                setEditingEndTime("");
                setEditMode(null);
                refetchEvents();
                onDataChange?.();
            }
        } catch (error) {
            console.error("時間の保存に失敗しました:", error);
        }
    };

    // 編集をキャンセル
    const handleCancelEdit = () => {
        setEditingTodo(null);
        setEditingEvent(null);
        setEditingMemo("");
        setEditingDescription("");
        setEditingDueDate("");
        setEditingStartTime("");
        setEditingEndTime("");
        setEditMode(null);
    };

    // 削除: Firestoreから候補データを取得するフック呼び出し

    if (!selectedDate) {
        // 日付が選択されていない場合の表示（コメントアウトを解除してもOK）
        return null;
    }

    const selectedDateString = selectedDate?.toDateString();

    // その日のイベントをフィルタ
    const dayEvents =
        eventsData?.events?.filter((event) => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === selectedDateString;
        }) || [];

    // その日のToDoをフィルタ（期限がその日のもの）
    const dayTodos =
        todosData?.todos?.filter((todo) => {
            if (!todo.due_date) return false;
            const dueDate = new Date(todo.due_date);
            return dueDate.toDateString() === selectedDateString;
        }) || [];

    // 削除: 候補データをフィルタリングするロジック

    return (
        <div>
            {/* Modal */}
            <input
                type="checkbox"
                id="my_modal_7"
                className="modal-toggle"
                checked={!!selectedDate}
                readOnly // checkedをstateで管理しない場合はreadOnlyを追加
            />
            <div className="modal" role="dialog">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">
                        {selectedDate?.getFullYear() ?? "年"}年
                        {(selectedDate?.getMonth() ?? -1) + 1}月
                        {selectedDate?.getDate() ?? "日"}
                        日のタスクと予定
                    </h3>
                    <div className="py-4">
                        <h4 className="font-semibold mb-2">タスク</h4>
                        {todosLoading && (
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-sm"></span>
                            </div>
                        )}
                        {!todosLoading && !todosError && dayTodos.length === 0 && (
                                <div className="text-center text-gray-500 py-4">
                                    タスクがありません
                                </div>
                            )}
                        {!todosLoading && !todosError && dayTodos.length > 0 && (
                                <div className="space-y-3">
                                    {dayTodos.map((todo) => (
                                        <div
                                            key={todo.id}
                                            className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={todo.completed}
                                                className="checkbox checkbox-sm"
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleToggleTodoCompletion(todo.id);
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            />
                                            <div className="flex-1">
                                            <div className={`font-medium ${todo.completed ? 'line-through opacity-60' : ''}`}>
                                                    {todo.title}
                                            </div>
                                            {editingTodo === todo.id && editMode === 'dueDate' ? (
                                                <div className="mt-2">
                                                    <input
                                                        type="date"
                                                        value={editingDueDate}
                                                        onChange={(e) => setEditingDueDate(e.target.value)}
                                                        className="input input-sm w-full"
                                                    />
                                                    <div className="flex gap-2 mt-1">
                                                        <button
                                                            className="btn btn-xs btn-primary"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleSaveTodoDueDate(todo.id);
                                                            }}
                                                        >
                                                            保存
                                                        </button>
                                                        <button
                                                            className="btn btn-xs btn-ghost"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            キャンセル
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                todo.due_date && (
                                                    <div className="text-xs uppercase font-semibold opacity-60">
                                                        期限: {new Date(todo.due_date).toLocaleDateString("ja-JP")}
                                                    </div>
                                                )
                                            )}
                                            {editingTodo === todo.id && editMode === 'memo' ? (
                                                <div className="mt-2">
                                                    <textarea
                                                        value={editingMemo}
                                                        onChange={(e) => setEditingMemo(e.target.value)}
                                                        className="textarea textarea-sm w-full"
                                                        placeholder="メモを入力..."
                                                        rows={2}
                                                    />
                                                    <div className="flex gap-2 mt-1">
                                                        <button
                                                            className="btn btn-xs btn-primary"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleSaveTodoMemo(todo.id);
                                                            }}
                                                        >
                                                            保存
                                                        </button>
                                                        <button
                                                            className="btn btn-xs btn-ghost"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            キャンセル
                                                        </button>
                                        </div>
                                                </div>
                                            ) : (
                                                todo.memo && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        {todo.memo}
                                                    </div>
                                                )
                                                )}
                                            </div>
                                        <div className="flex gap-1">
                                            <button 
                                                className="btn btn-square btn-ghost btn-sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleStartEditTodoMemo(todo);
                                                }}
                                                title="メモを編集"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 640 640"
                                                    className="size-[1em]"
                                                >
                                                    <path d="M256.1 312C322.4 312 376.1 258.3 376.1 192C376.1 125.7 322.4 72 256.1 72C189.8 72 136.1 125.7 136.1 192C136.1 258.3 189.8 312 256.1 312zM226.4 368C127.9 368 48.1 447.8 48.1 546.3C48.1 562.7 61.4 576 77.8 576L274.3 576L285.2 521.5C289.5 499.8 300.2 479.9 315.8 464.3L383.1 397C355.1 378.7 321.7 368.1 285.7 368.1L226.3 368.1zM332.3 530.9L320.4 590.5C320.2 591.4 320.1 592.4 320.1 593.4C320.1 601.4 326.6 608 334.7 608C335.7 608 336.6 607.9 337.6 607.7L397.2 595.8C409.6 593.3 421 587.2 429.9 578.3L548.8 459.4L468.8 379.4L349.9 498.3C341 507.2 334.9 518.6 332.4 531zM600.1 407.9C622.2 385.8 622.2 350 600.1 327.9C578 305.8 542.2 305.8 520.1 327.9L491.3 356.7L571.3 436.7L600.1 407.9z" />
                                                </svg>
                                            </button>
                                            <button 
                                                className="btn btn-square btn-ghost btn-sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleStartEditTodoDueDate(todo);
                                                }}
                                                title="期限を編集"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 640 640"
                                                    className="size-[1em]"
                                                >
                                                    <path d="M128 0C141.3 0 152 10.7 152 24V64H296V24C296 10.7 306.7 0 320 0C333.3 0 344 10.7 344 24V64H488V24C488 10.7 498.7 0 512 0C525.3 0 536 10.7 536 24V64H576C611.3 64 640 92.7 640 128V576C640 611.3 611.3 640 576 640H64C28.7 640 0 611.3 0 576V128C0 92.7 28.7 64 64 64H104V24C104 10.7 114.7 0 128 0zM576 192H64V576H576V192zM176 256C176 242.7 186.7 232 200 232H280C293.3 232 304 242.7 304 256V336C304 349.3 293.3 360 280 360H200C186.7 360 176 349.3 176 336V256zM360 256C360 242.7 370.7 232 384 232H464C477.3 232 488 242.7 488 256V336C488 349.3 477.3 360 464 360H384C370.7 360 360 349.3 360 336V256zM176 400C176 386.7 186.7 376 200 376H280C293.3 376 304 386.7 304 400V480C304 493.3 293.3 504 280 504H200C186.7 504 176 493.3 176 480V400zM360 400C360 386.7 370.7 376 384 376H464C477.3 376 488 386.7 488 400V480C488 493.3 477.3 504 464 504H384C370.7 504 360 493.3 360 480V400z" />
                                                </svg>
                                            </button>
                                        </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                    <div className="py-4">
                        <h4 className="font-semibold mb-2">予定</h4>
                        {eventsLoading && (
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-sm"></span>
                            </div>
                        )}
                        {eventsError && (
                            <div className="text-center text-red-500 text-sm">
                                エラー: {eventsError}
                            </div>
                        )}
                        {!eventsLoading && !eventsError && dayEvents.length === 0 && (
                                <div className="text-center text-gray-500 py-4">
                                    予定がありません
                                </div>
                            )}
                        {!eventsLoading && !eventsError && dayEvents.length > 0 && (
                                <div className="space-y-3">
                                    {dayEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="p-3 border border-gray-200 rounded-lg"
                                        >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={event.completed}
                                                className="checkbox checkbox-sm"
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleToggleEventCompletion(event.id);
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            />
                                            <div className="flex-1">
                                                <div className={`font-medium ${event.completed ? 'line-through opacity-60' : ''}`}>
                                                {event.title}
                                            </div>
                                                {editingEvent === event.id && editMode === 'time' ? (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 mb-1 block">開始時間</label>
                                                                <input
                                                                    type="datetime-local"
                                                                    value={editingStartTime}
                                                                    onChange={(e) => {
                                                                        setEditingStartTime(e.target.value);
                                                                        // 開始時間が終了時間より後になった場合、終了時間を調整
                                                                        if (e.target.value && editingEndTime && new Date(e.target.value) >= new Date(editingEndTime)) {
                                                                            const newEndTime = new Date(new Date(e.target.value).getTime() + 60 * 60 * 1000); // 1時間後
                                                                            setEditingEndTime(newEndTime.toISOString().slice(0, 16));
                                                                        }
                                                                    }}
                                                                    className="input input-sm w-full"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 mb-1 block">終了時間</label>
                                                                <input
                                                                    type="datetime-local"
                                                                    value={editingEndTime}
                                                                    onChange={(e) => setEditingEndTime(e.target.value)}
                                                                    min={editingStartTime}
                                                                    className="input input-sm w-full"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 pt-2">
                                                                <button
                                                                    className="btn btn-xs btn-primary flex-1"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleSaveEventTime(event.id);
                                                                    }}
                                                                >
                                                                    保存
                                                                </button>
                                                                <button
                                                                    className="btn btn-xs btn-ghost flex-1"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleCancelEdit();
                                                                    }}
                                                                >
                                                                    キャンセル
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs uppercase font-semibold opacity-60">
                                                        {(() => {
                                                            // バックエンドから送られてくるUTC時間を9時間前にして表示
                                                            const startUtc = new Date(event.start);
                                                            const endUtc = new Date(event.end);
                                                            
                                                            // 9時間前の時間を作成
                                                            const startMinus9h = new Date(startUtc.getTime() - 9 * 60 * 60 * 1000);
                                                            const endMinus9h = new Date(endUtc.getTime() - 9 * 60 * 60 * 1000);
                                                            
                                                            return `${startMinus9h.toLocaleDateString("ja-JP")} ${startMinus9h.toLocaleTimeString(
                                                                "ja-JP",
                                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                                }
                                                            )} - ${endMinus9h.toLocaleTimeString(
                                                                "ja-JP",
                                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                                }
                                                            )}`;
                                                        })()}
                                                    </div>
                                                )}
                                                {editingEvent === event.id && editMode === 'description' ? (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 mb-1 block">メモ</label>
                                                                <textarea
                                                                    value={editingDescription}
                                                                    onChange={(e) => setEditingDescription(e.target.value)}
                                                                    className="textarea textarea-sm w-full"
                                                                    placeholder="メモを入力..."
                                                                    rows={3}
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="btn btn-xs btn-primary flex-1"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleSaveEventDescription(event.id);
                                                                    }}
                                                                >
                                                                    保存
                                                                </button>
                                                                <button
                                                                    className="btn btn-xs btn-ghost flex-1"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleCancelEdit();
                                                                    }}
                                                                >
                                                                    キャンセル
                                                                </button>
                                                            </div>
                                                        </div>
                                            </div>
                                                ) : (
                                                    event.description && (
                                                        <div className="text-xs text-gray-400">
                                                    {event.description}
                                                </div>
                                                    )
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    className="btn btn-square btn-ghost btn-sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleStartEditEventDescription(event);
                                                    }}
                                                    title="メモを編集"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 640 640"
                                                        className="size-[1em]"
                                                    >
                                                        <path d="M256.1 312C322.4 312 376.1 258.3 376.1 192C376.1 125.7 322.4 72 256.1 72C189.8 72 136.1 125.7 136.1 192C136.1 258.3 189.8 312 256.1 312zM226.4 368C127.9 368 48.1 447.8 48.1 546.3C48.1 562.7 61.4 576 77.8 576L274.3 576L285.2 521.5C289.5 499.8 300.2 479.9 315.8 464.3L383.1 397C355.1 378.7 321.7 368.1 285.7 368.1L226.3 368.1zM332.3 530.9L320.4 590.5C320.2 591.4 320.1 592.4 320.1 593.4C320.1 601.4 326.6 608 334.7 608C335.7 608 336.6 607.9 337.6 607.7L397.2 595.8C409.6 593.3 421 587.2 429.9 578.3L548.8 459.4L468.8 379.4L349.9 498.3C341 507.2 334.9 518.6 332.4 531zM600.1 407.9C622.2 385.8 622.2 350 600.1 327.9C578 305.8 542.2 305.8 520.1 327.9L491.3 356.7L571.3 436.7L600.1 407.9z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    className="btn btn-square btn-ghost btn-sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleStartEditEventTime(event);
                                                    }}
                                                    title="時間を編集"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 640 640"
                                                        className="size-[1em]"
                                                    >
                                                        <path d="M128 0C141.3 0 152 10.7 152 24V64H296V24C296 10.7 306.7 0 320 0C333.3 0 344 10.7 344 24V64H488V24C488 10.7 498.7 0 512 0C525.3 0 536 10.7 536 24V64H576C611.3 64 640 92.7 640 128V576C640 611.3 611.3 640 576 640H64C28.7 640 0 611.3 0 576V128C0 92.7 28.7 64 64 64H104V24C104 10.7 114.7 0 128 0zM576 192H64V576H576V192zM176 256C176 242.7 186.7 232 200 232H280C293.3 232 304 242.7 304 256V336C304 349.3 293.3 360 280 360H200C186.7 360 176 349.3 176 336V256zM360 256C360 242.7 370.7 232 384 232H464C477.3 232 488 242.7 488 256V336C488 349.3 477.3 360 464 360H384C370.7 360 360 349.3 360 336V256zM176 400C176 386.7 186.7 376 200 376H280C293.3 376 304 386.7 304 400V480C304 493.3 293.3 504 280 504H200C186.7 504 176 493.3 176 480V400zM360 400C360 386.7 370.7 376 384 376H464C477.3 376 488 386.7 488 400V480C488 493.3 477.3 504 464 504H384C370.7 504 360 493.3 360 480V400z" />
                                                    </svg>
                                                </button>
                                            </div>
                                                </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                    <div className="modal-action">
                        <label
                            htmlFor="my_modal_7"
                            className="btn"
                            onClick={() => onClose?.()}
                        >
                            閉じる
                        </label>
                    </div>
                </div>
                <label
                    className="modal-backdrop"
                    htmlFor="my_modal_7"
                    onClick={() => onClose?.()}
                >
                    Close
                </label>
            </div>
        </div>
    );
};