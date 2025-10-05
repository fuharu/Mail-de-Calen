"use client";

import { useTodos } from "@/hooks/useApi";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { apiClient } from "@/lib/api";
import { useState, forwardRef, useImperativeHandle } from "react";

interface ToDoProps {
    onDataChange?: () => void;
}

export interface ToDoRef {
    refetch: () => void;
}

export const ToDo = forwardRef<ToDoRef, ToDoProps>(({ onDataChange }, ref) => {
    const { user } = useAuthContext();
    const { settings } = useSettings();
    const {
        data: todosResp,
        loading,
        error,
        refetch,
    } = useTodos();
    
    const [editingTodo, setEditingTodo] = useState<string | null>(null);
    const [editingMemo, setEditingMemo] = useState<string>("");
    const [editingDueDate, setEditingDueDate] = useState<string>("");
    const [editMode, setEditMode] = useState<'memo' | 'dueDate' | null>(null);

    const todosData = todosResp?.todos || [];

    // refetch関数を公開
    useImperativeHandle(ref, () => ({
        refetch
    }));

    // タスクの完了状態を切り替え
   const handleToggleCompletion = async (todoId: string) => {
       try {
           await apiClient.toggleTodoCompletion(todoId);
           refetch(); // データを再取得
           onDataChange?.(); // カレンダーを更新
       } catch (error) {
           console.error("タスクの完了状態切り替えに失敗しました:", error);
       }
   };

    // メモ編集を開始
    const handleStartEditMemo = (todo: any) => {
        setEditingTodo(todo.id);
        setEditingMemo(todo.memo || "");
        setEditMode('memo');
    };

   // 期限編集を開始
   const handleStartEditDueDate = (todo: any) => {
       setEditingTodo(todo.id);
       if (todo.due_date) {
           // UTC日付をローカル日付に変換して表示
           const utcDate = new Date(todo.due_date + 'Z'); // UTCとして解釈
           const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
           setEditingDueDate(localDate.toISOString().slice(0, 10));
       } else {
           setEditingDueDate("");
       }
       setEditMode('dueDate');
   };

   // メモ編集を保存
   const handleSaveMemo = async (todoId: string) => {
       try {
           console.log("メモ保存デバッグ:", { todoId, todosData, editingMemo });
           const todo = todosData.find(t => t.id === parseInt(todoId));
           console.log("見つかったタスク:", todo);
           if (todo) {
               await apiClient.updateTodo(todoId, {
                   ...todo,
                   memo: editingMemo
               });
               setEditingTodo(null);
               setEditingMemo("");
               setEditMode(null);
               refetch(); // データを再取得
               onDataChange?.(); // カレンダーを更新
           } else {
               console.error("タスクが見つかりません:", todoId);
           }
       } catch (error) {
           console.error("メモの保存に失敗しました:", error);
       }
   };

    // 期限編集を保存
    const handleSaveDueDate = async (todoId: string) => {
        try {
            console.log("期限保存デバッグ:", { todoId, todosData, editingDueDate });
            const todo = todosData.find(t => t.id === parseInt(todoId));
            console.log("見つかったタスク:", todo);
            if (todo) {
                // 日付のみを設定（UTCで00:00:00に設定してタイムゾーン問題を回避）
                let dueDate = null;
                if (editingDueDate) {
                    // 入力された日付をUTCの00:00:00として設定
                    const [year, month, day] = editingDueDate.split('-');
                    dueDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0)).toISOString();
                }
                console.log("保存する期限:", dueDate);
                await apiClient.updateTodo(todoId, {
                    ...todo,
                    due_date: dueDate
                });
                setEditingTodo(null);
                setEditingDueDate("");
                setEditMode(null);
                refetch(); // データを再取得
                onDataChange?.(); // カレンダーを更新
            } else {
                console.error("タスクが見つかりません:", todoId);
            }
        } catch (error) {
            console.error("期限の保存に失敗しました:", error);
        }
    };

    // 編集をキャンセル
    const handleCancelEdit = () => {
        setEditingTodo(null);
        setEditingMemo("");
        setEditingDueDate("");
        setEditMode(null);
    };

    // 設定された日数以内のタスクのみをフィルタリング
    const todos =
        todosData?.filter((todo) => {
            if (!todo.due_date) return true; // 期限がないタスクは常に表示
            const dueDate = new Date(todo.due_date);
            const now = new Date();
            const diffTime = dueDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= settings.recentDays;
        }) || [];

    if (loading) {
        return (
            <div className="bg-base-100 rounded-box shadow-md m-5 p-4">
                <div className="text-center">
                    <span className="loading loading-spinner loading-md"></span>
                    <div className="text-sm text-gray-500 mt-2">
                        ToDo読み込み中...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-base-100 rounded-box shadow-md m-5 p-4">
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
        <div>
            <ul className="list bg-base-100 rounded-box shadow-md m-5">
                <li className="p-4 pb-2 text-xs opacity-90 tracking-wide">
                    直近のタスク
                </li>

                {todos.length === 0 ? (
                    <li className="p-4 text-center text-gray-500">
                        タスクがありません
                    </li>
                ) : (
                    todos.map((todo) => (
                        <li
                            key={todo.id}
                            className="list-row"
                        >
                            <div>
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    className="checkbox checkbox-sm"
                                    onChange={() => handleToggleCompletion(todo.id)}
                                />
                            </div>
                            <div className="flex-1">
                                <div className={`${todo.completed ? 'line-through opacity-60' : ''}`}>
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
                                                onClick={() => handleSaveDueDate(todo.id)}
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
                                            期限:{" "}
                                            {new Date(
                                                todo.due_date
                                            ).toLocaleDateString("ja-JP")}
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
                                                onClick={() => handleSaveMemo(todo.id)}
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
                                    onClick={() => handleStartEditMemo(todo)}
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
                                    onClick={() => handleStartEditDueDate(todo)}
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
                        </li>
                    ))
                )}
            </ul>
            </div>
        );
    });
