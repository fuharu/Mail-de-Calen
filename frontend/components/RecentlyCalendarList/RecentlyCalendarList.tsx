"use client";

import { useEvents } from "@/hooks/useApi";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { apiClient } from "@/lib/api";
import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";

interface RecentlyCalendarListProps {
    onDataChange?: () => void;
}

export interface RecentlyCalendarListRef {
    refetch: () => void;
}

export const RecentlyCalendarList = forwardRef<RecentlyCalendarListRef, RecentlyCalendarListProps>(({ onDataChange }, ref) => {
    const { user } = useAuthContext();
    const { settings } = useSettings();
    const {
        data: eventsResp,
        loading,
        error,
        refetch,
    } = useEvents();
    
    const [editingEvent, setEditingEvent] = useState<string | null>(null);
    const [editingDescription, setEditingDescription] = useState<string>("");
    const [editingStartTime, setEditingStartTime] = useState<string>("");
    const [editingEndTime, setEditingEndTime] = useState<string>("");
    const [editMode, setEditMode] = useState<'description' | 'time' | null>(null);
    
    // スクロール位置を保持するためのref
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0);

    // apiClient returns { events: [...] }
    const eventsData = eventsResp?.events || [];

    // スクロール位置を保存・復元する関数
    const saveScrollPosition = () => {
        if (containerRef.current) {
            scrollPositionRef.current = window.scrollY;
        }
    };

    const restoreScrollPosition = () => {
        if (scrollPositionRef.current > 0) {
            setTimeout(() => {
                window.scrollTo(0, scrollPositionRef.current);
            }, 0);
        }
    };

    // データ更新時にスクロール位置を復元
    useEffect(() => {
        if (eventsData.length > 0) {
            restoreScrollPosition();
        }
    }, [eventsData]);

    // refetch関数を公開
    useImperativeHandle(ref, () => ({
        refetch
    }));

    // 予定の完了状態を切り替え
   const handleToggleCompletion = async (eventId: string) => {
       try {
           saveScrollPosition(); // スクロール位置を保存
           await apiClient.toggleEventCompletion(eventId);
           refetch(); // データを再取得
           onDataChange?.(); // カレンダーを更新
       } catch (error) {
           console.error("予定の完了状態切り替えに失敗しました:", error);
       }
   };

    // メモ編集を開始
    const handleStartEditDescription = (event: any) => {
        setEditingEvent(event.id);
        setEditingDescription(event.description || "");
        setEditMode('description');
    };

    // 時間編集を開始
    const handleStartEditTime = (event: any) => {
        setEditingEvent(event.id);
        // バックエンドから送られてくるUTC時間をそのまま編集フォームに設定
        const startUtc = new Date(event.start);
        const endUtc = new Date(event.end);
        
        setEditingStartTime(startUtc.toISOString().slice(0, 16));
        setEditingEndTime(endUtc.toISOString().slice(0, 16));
        setEditMode('time');
    };

   // メモ編集を保存
   const handleSaveDescription = async (eventId: string) => {
       try {
           saveScrollPosition(); // スクロール位置を保存
           console.log("予定メモ保存デバッグ:", { eventId, eventsData, editingDescription });
           const event = eventsData.find(e => e.id === parseInt(eventId));
           console.log("見つかった予定:", event);
           if (event) {
               await apiClient.updateEvent(eventId, {
                   ...event,
                   description: editingDescription
               });
               setEditingEvent(null);
               setEditingDescription("");
               setEditMode(null);
               refetch(); // データを再取得
               onDataChange?.(); // カレンダーを更新
           } else {
               console.error("予定が見つかりません:", eventId);
           }
       } catch (error) {
           console.error("メモの保存に失敗しました:", error);
       }
   };

    // 時間編集を保存
    const handleSaveTime = async (eventId: string) => {
        try {
            saveScrollPosition(); // スクロール位置を保存
            console.log("予定時間保存デバッグ:", { eventId, eventsData, editingStartTime, editingEndTime });
            
            // 時間の妥当性チェック
            const startTime = new Date(editingStartTime);
            const endTime = new Date(editingEndTime);
            
            if (startTime >= endTime) {
                alert("開始時間は終了時間より前である必要があります。");
                return;
            }
            
            const event = eventsData.find(e => e.id === parseInt(eventId));
            console.log("見つかった予定:", event);
            if (event) {
                // 編集された時間（9時間前）に9時間を足してUTC時間として保存
                const startTimePlus9h = new Date(startTime.getTime() + 9 * 60 * 60 * 1000);
                const endTimePlus9h = new Date(endTime.getTime() + 9 * 60 * 60 * 1000);
                const startTimeUTC = startTimePlus9h.toISOString();
                const endTimeUTC = endTimePlus9h.toISOString();
                console.log("保存する時間:", { startTimeUTC, endTimeUTC });
                await apiClient.updateEvent(eventId, {
                    ...event,
                    start: startTimeUTC,
                    end: endTimeUTC
                });
                setEditingEvent(null);
                setEditingStartTime("");
                setEditingEndTime("");
                setEditMode(null);
                refetch(); // データを再取得
                onDataChange?.(); // カレンダーを更新
            } else {
                console.error("予定が見つかりません:", eventId);
            }
        } catch (error) {
            console.error("時間の保存に失敗しました:", error);
        }
    };

    // 編集をキャンセル
    const handleCancelEdit = () => {
        setEditingEvent(null);
        setEditingDescription("");
        setEditingStartTime("");
        setEditingEndTime("");
        setEditMode(null);
    };

    // 設定された日数以内のイベントのみをフィルタリング
    const events =
        eventsData?.filter((event) => {
            const eventDate = new Date(event.start);
            const now = new Date();
            const diffTime = eventDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= settings.recentDays;
        }) || [];

    if (loading) {
        return (
            <div className="bg-base-100 rounded-box shadow-md m-5 p-4">
                <div className="text-center">
                    <span className="loading loading-spinner loading-md"></span>
                    <div className="text-sm text-gray-500 mt-2">
                        予定読み込み中...
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
        <div ref={containerRef}>
            <ul className="list bg-base-100 rounded-box shadow-md m-5">
                <li className="p-4 pb-2 text-xs opacity-90 tracking-wide">
                    直近の予定
                </li>

                {events.length === 0 ? (
                    <li className="p-4 text-center text-gray-500">
                        予定がありません
                    </li>
                ) : (
                    events.map((event) => (
                        <li
                            key={event.id}
                            className="list-row"
                        >
                            <div>
                                <input
                                    type="checkbox"
                                    checked={event.completed}
                                    className="checkbox checkbox-sm"
                                    onChange={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleToggleCompletion(event.id);
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className={`${event.completed ? 'line-through opacity-60' : ''}`}>
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
                                                        handleSaveTime(event.id);
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
                                                        handleSaveDescription(event.id);
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
                                        handleStartEditDescription(event);
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
                                        handleStartEditTime(event);
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
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
});
