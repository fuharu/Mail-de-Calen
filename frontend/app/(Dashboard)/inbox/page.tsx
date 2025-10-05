"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEvents, useTodos } from "@/hooks/useApi";
import { useEmails } from "@/hooks/useApi";

export default function InboxPage() {
    const { user, loading: authLoading } = useAuthContext();
    const [activeTab, setActiveTab] = useState<"emails" | "events" | "todos">(
        "emails"
    );

    // Firestoreからデータを取得
    const {
        data: eventsResp,
        loading: eventsLoading,
        error: eventsError,
        refetch: refetchEvents,
    } = useEvents();

    const {
        data: todosResp,
        loading: todosLoading,
        error: todosError,
        refetch: refetchTodos,
    } = useTodos();

    const eventCandidates = eventsResp?.events || [];
    const todoCandidates = todosResp?.todos || [];

    // APIからメールデータを取得
    const {
        data: emailsData,
        loading: emailsLoading,
        error: emailsError,
        refetch: refetchEmails,
    } = useEmails(20);

    const getStatusBadge = (status: string) => {
        const baseClasses = "badge badge-sm";
        switch (status) {
            case "pending":
                return `${baseClasses} badge-warning`;
            case "approved":
                return `${baseClasses} badge-success`;
            case "rejected":
                return `${baseClasses} badge-error`;
            default:
                return `${baseClasses} badge-neutral`;
        }
    };

    const formatDate = (dateString: string | any) => {
        if (!dateString) return "N/A";
        const date =
            typeof dateString === "string"
                ? new Date(dateString)
                : dateString.toDate
                ? dateString.toDate()
                : new Date(dateString);
        return date.toLocaleString("ja-JP");
    };

    const handleApproveEvent = async (eventId: string) => {
        // イベント承認処理
        console.log("イベントを承認:", eventId);
        // 実際の実装ではAPIを呼び出してステータスを更新
        refetchEvents();
    };

    const handleRejectEvent = async (eventId: string) => {
        // イベント却下処理
        console.log("イベントを却下:", eventId);
        // 実際の実装ではAPIを呼び出してステータスを更新
        refetchEvents();
    };

    const handleApproveTodo = async (todoId: string) => {
        // ToDo承認処理
        console.log("ToDoを承認:", todoId);
        // 実際の実装ではAPIを呼び出してステータスを更新
        refetchTodos();
    };

    const handleRejectTodo = async (todoId: string) => {
        // ToDo却下処理
        console.log("ToDoを却下:", todoId);
        // 実際の実装ではAPIを呼び出してステータスを更新
        refetchTodos();
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
                    <div className="text-lg mt-4">
                        ログインページにリダイレクト中...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 bg-gray-50 min-h-screen">
            {/* ヘッダー */}
            <div className="navbar bg-base-100 shadow-sm lg:hidden">
                <div className="flex-1">
                    <div className="text-xl font-bold">
                        <Image
                            src="/logo_main.png"
                            alt="Mail de Calen"
                            width={150}
                            height={32}
                            className="inline-block mr-2"
                            style={{ width: "auto", height: "auto" }}
                            priority
                        />
                    </div>
                </div>
                <div className="flex-none">
                    <button className="btn btn-square btn-ghost">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="inline-block h-5 w-5 stroke-current"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Inbox</h1>

                {/* タブナビゲーション */}
                <div className="tabs tabs-bordered mb-6">
                    <button
                        className={`tab ${
                            activeTab === "emails" ? "tab-active" : ""
                        }`}
                        onClick={() => setActiveTab("emails")}
                    >
                        メール ({emailsData?.emails?.length || 0})
                    </button>
                    <button
                        className={`tab ${
                            activeTab === "events" ? "tab-active" : ""
                        }`}
                        onClick={() => setActiveTab("events")}
                    >
                        イベント候補 ({eventCandidates?.length || 0})
                    </button>
                    <button
                        className={`tab ${
                            activeTab === "todos" ? "tab-active" : ""
                        }`}
                        onClick={() => setActiveTab("todos")}
                    >
                        ToDo候補 ({todoCandidates?.length || 0})
                    </button>
                </div>

                {/* メールタブ */}
                {activeTab === "emails" && (
                    <div className="bg-base-100 rounded-box shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                最近のメール
                            </h2>
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={refetchEmails}
                                disabled={emailsLoading}
                            >
                                {emailsLoading ? "読み込み中..." : "更新"}
                            </button>
                        </div>

                        {emailsLoading && (
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-md"></span>
                                <div className="text-sm text-gray-500 mt-2">
                                    メール読み込み中...
                                </div>
                            </div>
                        )}

                        {emailsError && (
                            <div className="alert alert-error">
                                <span>エラー: {emailsError}</span>
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
                                    <div
                                        key={email.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-800">
                                                    {email.subject}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    送信者: {email.sender}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    受信日時:{" "}
                                                    {formatDate(email.date)}
                                                </p>
                                                {email.body && (
                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                        {email.body.substring(
                                                            0,
                                                            200
                                                        )}
                                                        ...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* イベント候補タブ */}
                {activeTab === "events" && (
                    <div className="bg-base-100 rounded-box shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                イベント候補
                            </h2>
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={refetchEvents}
                                disabled={eventsLoading}
                            >
                                {eventsLoading ? "読み込み中..." : "更新"}
                            </button>
                        </div>

                        {eventsLoading && (
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-md"></span>
                                <div className="text-sm text-gray-500 mt-2">
                                    イベント読み込み中...
                                </div>
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
                                    <div
                                        key={candidate.id}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-lg">
                                                    {candidate.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    開始: {candidate.start} -
                                                    終了: {candidate.end}
                                                </p>
                                                {candidate.description && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {candidate.description}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    作成日時:{" "}
                                                    {formatDate(
                                                        candidate.created_at
                                                    )}
                                                </p>
                                            </div>
                                            <span
                                                className={getStatusBadge(
                                                    candidate.status
                                                )}
                                            >
                                                {candidate.status === "pending"
                                                    ? "保留中"
                                                    : candidate.status ===
                                                      "approved"
                                                    ? "承認済み"
                                                    : "却下"}
                                            </span>
                                        </div>

                                        {candidate.status === "pending" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleApproveEvent(
                                                            candidate.id
                                                        )
                                                    }
                                                    className="btn btn-sm btn-success"
                                                >
                                                    承認
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRejectEvent(
                                                            candidate.id
                                                        )
                                                    }
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
                {activeTab === "todos" && (
                    <div className="bg-base-100 rounded-box shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">ToDo候補</h2>
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={refetchTodos}
                                disabled={todosLoading}
                            >
                                {todosLoading ? "読み込み中..." : "更新"}
                            </button>
                        </div>

                        {todosLoading && (
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-md"></span>
                                <div className="text-sm text-gray-500 mt-2">
                                    ToDo読み込み中...
                                </div>
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
                                    <div
                                        key={candidate.id}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            candidate.completed
                                                        }
                                                        className="checkbox checkbox-sm"
                                                        readOnly
                                                    />
                                                    <h3 className="font-medium text-lg">
                                                        {candidate.title}
                                                    </h3>
                                                </div>
                                                {candidate.due_date && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        期限:{" "}
                                                        {candidate.due_date}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    作成日時:{" "}
                                                    {formatDate(
                                                        candidate.created_at
                                                    )}
                                                </p>
                                            </div>
                                            <span
                                                className={getStatusBadge(
                                                    candidate.status
                                                )}
                                            >
                                                {candidate.status === "pending"
                                                    ? "保留中"
                                                    : candidate.status ===
                                                      "approved"
                                                    ? "承認済み"
                                                    : "却下"}
                                            </span>
                                        </div>

                                        {candidate.status === "pending" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleApproveTodo(
                                                            candidate.id
                                                        )
                                                    }
                                                    className="btn btn-sm btn-success"
                                                >
                                                    承認
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRejectTodo(
                                                            candidate.id
                                                        )
                                                    }
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
                </div>
            </div>
        </div>
    );
}
