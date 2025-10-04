"use client";

import { useState } from "react";
import { useEvents, useTodos } from "@/hooks/useApi";

interface AllCalendarProps {
    onDateSelect?: (date: Date | null) => void;
}

export const AllCalendar = ({ onDateSelect }: AllCalendarProps) => {
    const { data: eventsData, loading, error, refetch } = useEvents();
    const { data: todosData } = useTodos();
    const events = eventsData?.events || [];
    const todos = todosData?.todos || [];

    const [currentDate, setCurrentDate] = useState(new Date());

    // デバッグ用ログ
    console.log('📅 Calendar Debug:', {
        events: events,
        todos: todos,
        eventsCount: events.length,
        todosCount: todos.length,
        currentDate: currentDate,
        currentMonth: currentDate.getMonth() + 1,
        currentYear: currentDate.getFullYear()
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月",
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
        const dayEvents = events.filter((event) => {
            const eventDate = new Date(event.start);
            const isMatch = eventDate.toDateString() === currentDateForLoop.toDateString();
            if (isMatch) {
                console.log('📅 Event match found:', {
                    event: event.title,
                    eventDate: eventDate.toDateString(),
                    calendarDate: currentDateForLoop.toDateString()
                });
            }
            return isMatch;
        });

        const dayTodos = todos.filter((todo) => {
            if (!todo.due_date) return false;
            const dueDate = new Date(todo.due_date);
            const isMatch = dueDate.toDateString() === currentDateForLoop.toDateString();
            if (isMatch) {
                console.log('📅 Todo match found:', {
                    todo: todo.title,
                    dueDate: dueDate.toDateString(),
                    calendarDate: currentDateForLoop.toDateString()
                });
            }
            return isMatch;
        });

        calendarDays.push({
            date: new Date(currentDateForLoop),
            events: dayEvents,
            todos: dayTodos,
            eventCount: dayEvents.length,
            todoCount: dayTodos.length,
            isCurrentMonth: currentDateForLoop.getMonth() === month,
            isToday: currentDateForLoop.toDateString() === today.toDateString(),
            isSelected: selectedDate
                ? currentDateForLoop.toDateString() ===
                  selectedDate.toDateString()
                : false,
        });

        currentDateForLoop.setDate(currentDateForLoop.getDate() + 1);
    }

    // if (loading) {
    //     return (
    //         <div className="p-6 bg-base-100 rounded-box shadow-md m-5">
    //             <div className="text-center">
    //                 <span className="loading loading-spinner loading-md"></span>
    //                 <div className="text-sm text-gray-500 mt-2">
    //                     カレンダー読み込み中...
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className="p-6 bg-base-100 rounded-box shadow-md m-5">
    //             <div className="text-center text-red-500">
    //                 <div className="text-sm">エラー: {error}</div>
    //                 <button
    //                     className="btn btn-sm btn-outline mt-2"
    //                     onClick={refetch}
    //                 >
    //                     再試行
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="p-6 bg-base-100 rounded-box shadow-md m-5">
            {/* カレンダーヘッダー */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={goToPreviousMonth}
                    className="btn btn-sm btn-ghost"
                >
                    ←
                </button>

                <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {year}年{monthNames[month]}
                    </h2>
                    <button
                        onClick={goToToday}
                        className="btn btn-sm btn-ghost mt-10 text-gray-600"
                    >
                        今日
                    </button>
                </div>

                <button
                    onClick={goToNextMonth}
                    className="btn btn-sm btn-ghost"
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
                                className={`py-2 ${
                                    index === 0
                                        ? "text-red-500"
                                        : index === 6
                                        ? "text-blue-500"
                                        : ""
                                }`}
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from(
                        { length: Math.ceil(calendarDays.length / 7) },
                        (_, weekIndex) => (
                            <tr
                                key={weekIndex}
                                className="hover:bg-gray-50"
                            >
                                {Array.from({ length: 7 }, (_, dayIndex) => {
                                    const dayData =
                                        calendarDays[weekIndex * 7 + dayIndex];
                                    if (!dayData)
                                        return (
                                            <td
                                                key={dayIndex}
                                                className="h-16 w-12"
                                            ></td>
                                        );

                                    const {
                                        date,
                                        events,
                                        todos,
                                        eventCount,
                                        todoCount,
                                        isCurrentMonth,
                                        isToday,
                                        isSelected,
                                    } = dayData;

                                    return (
                                        <td
                                            key={dayIndex}
                                            className={`h-16 w-12 border border-gray-200 cursor-pointer ${
                                                !isCurrentMonth
                                                    ? "text-gray-400"
                                                    : isSelected
                                                    ? "bg-yellow-200"
                                                    : isToday
                                                    ? "text-black font-bold"
                                                    : date.getDay() === 0
                                                    ? "text-red-500"
                                                    : date.getDay() === 6
                                                    ? "text-blue-500"
                                                    : "text-gray-800"
                                            }`}
                                            onClick={() =>
                                                handleDateClick(date.getDate())
                                            }
                                        >
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <div className="text-sm font-medium">
                                                    {date.getDate()}
                                                </div>
                                                {(eventCount > 0 || todoCount > 0) && (
                                                    <div className="flex gap-1 mt-1">
                                                        {eventCount > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                                <span className="text-xs text-blue-600 font-medium">
                                                                    {eventCount}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {todoCount > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                                <span className="text-xs text-orange-600 font-medium">
                                                                    {todoCount}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        )
                    )}
                </tbody>
            </table>

            <div className="mt-4 space-y-2">
                <div className="text-center text-gray-500 text-sm">
                    日付を押すと詳細が表示されます
                </div>
                <div className="flex justify-center items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-600">予定</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-orange-600">タスク</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
