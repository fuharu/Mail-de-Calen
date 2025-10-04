'use client';

import { useState } from 'react';
import { useEvents } from "@/hooks/useApi";

interface AllCalendarProps {
    onDateSelect?: (date: Date | null) => void;
}

export const AllCalendar = ({ onDateSelect }: AllCalendarProps) => {
    const { data: eventsData, loading, error, refetch } = useEvents();
    const events = eventsData?.events || [];
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
        isCurrentMonth: boolean;
        isToday: boolean;
        isSelected: boolean;
    }

    const calendarDays: CalendarDay[] = [];
    const currentDateForLoop = new Date(startDate);
    
    while (currentDateForLoop <= endDate) {
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === currentDateForLoop.toDateString();
        });
        
        calendarDays.push({
            date: new Date(currentDateForLoop),
            events: dayEvents,
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
                                
                                const { date, events, isCurrentMonth, isToday, isSelected } = dayData;
                                
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
                                        {date.getDate()}
                                        {events.length > 0 && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {events.length === 0 && (
                <div className="text-center text-gray-500 mt-4">
                    今月の予定がありません
                </div>
            )}
        </div>
    );
};
