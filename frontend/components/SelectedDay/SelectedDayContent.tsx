"use client";

import { useEvents, useTodos } from "@/hooks/useApi";
// 削除: import { useEventCandidates, useTodoCandidates } from "@/hooks/useFirestore";
import { useEffect } from "react";

interface SelectedDayContentProps {
    selectedDate: Date | null;
    onClose?: () => void;
}

export const SelectedDayContent = ({
    selectedDate,
    onClose,
}: SelectedDayContentProps) => {
    const {
        data: eventsData,
        loading: eventsLoading,
        error: eventsError,
    } = useEvents();

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
    const {
        data: todosData,
        loading: todosLoading,
        error: todosError,
    } = useTodos();

    // 削除: Firestoreから候補データを取得するフック呼び出し

    if (!selectedDate) {
        // 日付が選択されていない場合の表示（コメントアウトを解除してもOK）
        return <div>日付を選択してください</div>;
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
                                            readOnly
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{todo.title}</div>
                                        </div>
                                        <span className="badge badge-sm badge-success">
                                            承認済み
                                        </span>
                                    </div>
                                ))}
                                {/* 削除: 候補ToDoの表示部分 */}
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
                                        <div className="font-medium">{event.title}</div>
                                        {/* ...その他の表示... */}
                                        <span className="badge badge-sm badge-success mt-2">
                                            承認済み
                                        </span>
                                    </div>
                                ))}
                                {/* 削除: 候補イベントの表示部分 */}
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