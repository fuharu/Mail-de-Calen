'use client';

import { useEvents } from "@/hooks/useApi";

export const RecentlyCalendarList = () => {
    const { data: eventsData, loading, error, refetch } = useEvents();
    
    const events = eventsData?.events || [];

    if (loading) {
        return (
            <div className="bg-base-100 rounded-box shadow-md m-5 p-4">
                <div className="text-center">
                    <span className="loading loading-spinner loading-md"></span>
                    <div className="text-sm text-gray-500 mt-2">予定読み込み中...</div>
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
                        <div></div>
                        <div>
                            <div>{event.title}</div>
                            <div className="text-xs uppercase font-semibold opacity-60">
                                {new Date(event.start).toLocaleTimeString('ja-JP', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })} - {new Date(event.end).toLocaleTimeString('ja-JP', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </div>
                            {event.description && (
                                <div className="text-xs text-gray-400">
                                    {event.description}
                                </div>
                            )}
                        </div>
                        <button className="btn btn-square btn-ghost">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 640"
                                className="size-[1.2em]"
                            >
                                <path d="M256.1 312C322.4 312 376.1 258.3 376.1 192C376.1 125.7 322.4 72 256.1 72C189.8 72 136.1 125.7 136.1 192C136.1 258.3 189.8 312 256.1 312zM226.4 368C127.9 368 48.1 447.8 48.1 546.3C48.1 562.7 61.4 576 77.8 576L274.3 576L285.2 521.5C289.5 499.8 300.2 479.9 315.8 464.3L383.1 397C355.1 378.7 321.7 368.1 285.7 368.1L226.3 368.1zM332.3 530.9L320.4 590.5C320.2 591.4 320.1 592.4 320.1 593.4C320.1 601.4 326.6 608 334.7 608C335.7 608 336.6 607.9 337.6 607.7L397.2 595.8C409.6 593.3 421 587.2 429.9 578.3L548.8 459.4L468.8 379.4L349.9 498.3C341 507.2 334.9 518.6 332.4 531zM600.1 407.9C622.2 385.8 622.2 350 600.1 327.9C578 305.8 542.2 305.8 520.1 327.9L491.3 356.7L571.3 436.7L600.1 407.9z" />
                            </svg>
                        </button>
                        <button className="btn btn-square btn-ghost">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 640"
                                className="size-[1.2em]"
                            >
                                <path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z" />
                            </svg>
                        </button>
                    </li>
                    ))
                )}
            </ul>
        </div>
    );
};
