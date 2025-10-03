export const AllCalendar = () => {
    return (
        <div className="p-6 bg-base-100 rounded-box shadow-md m-5">
            <div className="text-center text-lg font-semibold text-gray-800 mb-4">
                {new Date().toLocaleString("default", {
                    year: "numeric",
                    month: "long",
                })}
            </div>
            <table className="table-auto w-full text-center text-sm font-medium text-gray-800 bg-white">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="py-2 text-red-500">Sun</th>
                        <th className="py-2">Mon</th>
                        <th className="py-2">Tue</th>
                        <th className="py-2">Wed</th>
                        <th className="py-2">Thu</th>
                        <th className="py-2">Fri</th>
                        <th className="py-2 text-blue-500">Sat</th>
                    </tr>
                </thead>
                <tbody>
                    {(() => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = today.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(
                            year,
                            month + 1,
                            0
                        ).getDate();
                        const weeks = Math.ceil((firstDay + daysInMonth) / 7);

                        return Array.from({ length: weeks }, (_, week) => (
                            <tr
                                key={week}
                                className="hover:bg-gray-50"
                            >
                                {Array.from({ length: 7 }, (_, day) => {
                                    const date = week * 7 + day - firstDay + 1;
                                    const isSunday = day === 0;
                                    const isSaturday = day === 6;
                                    const isToday =
                                        date === today.getDate() &&
                                        month === today.getMonth() &&
                                        year === today.getFullYear();

                                    return date > 0 && date <= daysInMonth ? (
                                        <td
                                            key={day}
                                            className={`h-12 w-12 border border-gray-200 bg-white hover:bg-gray-100 ${
                                                isToday
                                                    ? "bg-yellow-200 text-black font-bold"
                                                    : isSunday
                                                    ? "text-red-500"
                                                    : isSaturday
                                                    ? "text-blue-500"
                                                    : "text-gray-800"
                                            }`}
                                        >
                                            {date}
                                        </td>
                                    ) : (
                                        <td key={day}></td>
                                    );
                                })}
                            </tr>
                        ));
                    })()}
                </tbody>
            </table>
        </div>
    );
};
