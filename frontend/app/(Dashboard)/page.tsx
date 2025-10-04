'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RecentlyCalendarList } from "@/components/RecentlyCalendarList/RecentlyCalendarList";
import { AllCalendar } from "@/components/AllCalendar/AllCalendar";
import { ToDo } from "@/components/ToDO/ToDo";
import { UserProfile } from "@/components/Auth/UserProfile";
import { SelectedDayContent } from "@/components/SelectedDay/SelectedDayContent";
import { useHealthCheck } from "@/hooks/useApi";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Home() {
    const { user, loading: authLoading } = useAuthContext();
    const { data: healthData, loading: healthLoading, error: healthError } = useHealthCheck();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <div className="text-lg mt-4">認証確認中...</div>
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
        <div className="pb-20 bg-gray-50">
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
                            {" "}
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                            ></path>{" "}
                        </svg>
                    </button>
                </div>
            </div>

            <UserProfile />
            
            {/* API接続ステータス */}
            <div className="px-5 pb-2">
                {healthLoading && (
                    <div className="text-xs text-blue-500">API接続中...</div>
                )}
                {healthError && (
                    <div className="text-xs text-red-500">API接続エラー: {healthError}</div>
                )}
                {healthData && (
                    <div className="text-xs text-green-500">✓ API接続成功</div>
                )}
            </div>
            <AllCalendar onDateSelect={setSelectedDate} />
            
            {/* 選択された日のタスクと予定 */}
            <SelectedDayContent selectedDate={selectedDate} />
            
            <div className="lg:grid lg:grid-cols-2">
                <ToDo />
                <RecentlyCalendarList />
            </div>
        </div>
    );
}
