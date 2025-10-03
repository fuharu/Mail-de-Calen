"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationProps {
    children: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
    const pathname = usePathname().split("/")[1] || "dashboard";
    const [activeLink, setActiveLink] = useState<string>("dashboard");
    useEffect(() => {
        setActiveLink(pathname);
    }, [pathname]);
    return (
        <div>
            <div className="drawer lg:drawer-open">
                <input
                    id="drawer-for-sidebar"
                    type="checkbox"
                    className="drawer-toggle"
                />
                <div className="drawer-content">{children}</div>
                <div className="drawer-side">
                    <label
                        htmlFor="drawer-for-sidebar"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    <ul className="menu bg-base-100 text-base-content min-h-full w-80 p-4">
                        <li>
                            <div className="text-xl font-bold py-4">
                                <Image
                                    src="/logo_main.png"
                                    alt="Mail de Calen"
                                    width={300}
                                    height={32}
                                    className="inline-block mr-2"
                                    style={{
                                        width: "auto",
                                        height: "auto",
                                    }}
                                    priority
                                />
                            </div>
                        </li>
                        <li>
                            <Link
                                href={"/"}
                                className={`${
                                    activeLink === "dashboard"
                                        ? "menu-active fill-white"
                                        : ""
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    className="inline-block h-5 w-5 stroke-current"
                                >
                                    <path d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z" />
                                </svg>
                                Dashboard
                            </Link>
                            <ul className="ml-4">
                                <li>
                                    <a>...</a>
                                </li>
                                <li>
                                    <a>...</a>
                                </li>
                                <li>
                                    <a>...</a>
                                </li>
                                <li>
                                    <a>...</a>
                                </li>
                                <li>
                                    <a>...</a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <Link
                                href={"/inbox"}
                                className={`${
                                    activeLink === "inbox"
                                        ? "menu-active fill-white"
                                        : ""
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    className="inline-block h-5 w-5 stroke-current"
                                >
                                    <path d="M155.8 96C123.9 96 96.9 119.4 92.4 150.9L64.6 345.2C64.2 348.2 64 351.2 64 354.3L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 354.3C576 351.3 575.8 348.2 575.4 345.2L547.6 150.9C543.1 119.4 516.1 96 484.2 96L155.8 96zM155.8 160L484.3 160L511.7 352L451.8 352C439.7 352 428.6 358.8 423.2 369.7L408.9 398.3C403.5 409.1 392.4 416 380.3 416L259.9 416C247.8 416 236.7 409.2 231.3 398.3L217 369.7C211.6 358.9 200.5 352 188.4 352L128.3 352L155.8 160z" />
                                </svg>
                                Inbox
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={"/settings"}
                                className={`${
                                    activeLink === "settings"
                                        ? "menu-active fill-white"
                                        : ""
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    className="inline-block h-5 w-5 stroke-current"
                                >
                                    <path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z" />
                                </svg>
                                Settings
                            </Link>
                            <ul className="ml-4">
                                <li>
                                    <a>キーワード</a>
                                </li>
                                <li>
                                    <a>外部カレンダー連携</a>
                                </li>
                                <li>
                                    <a>メール連携</a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <Link
                                href={"/account"}
                                className={`${
                                    activeLink === "account"
                                        ? "menu-active fill-white"
                                        : ""
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    className="inline-block h-5 w-5 stroke-current"
                                >
                                    <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
                                </svg>
                                Account
                            </Link>
                            <ul className="ml-4">
                                <li>
                                    <a>プロフィール</a>
                                </li>
                                <li>
                                    <a>ログアウト</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="lg:hidden">
                <div className="dock">
                    <Link
                        href={"/"}
                        className={`${
                            activeLink === "dashboard" ? "dock-active" : ""
                        }`}
                    >
                        <svg
                            className="size-[1.2em]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <g
                                fill="currentColor"
                                strokeLinejoin="miter"
                                strokeLinecap="butt"
                            >
                                <polyline
                                    points="1 11 12 2 23 11"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"
                                ></polyline>
                                <path
                                    d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="square"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"
                                ></path>
                                <line
                                    x1="12"
                                    y1="22"
                                    x2="12"
                                    y2="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="square"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"
                                ></line>
                            </g>
                        </svg>
                        <span className="dock-label">Dashboard</span>
                    </Link>

                    <Link
                        href={"/inbox"}
                        className={`${
                            activeLink === "inbox" ? "dock-active" : ""
                        }`}
                    >
                        <svg
                            className="size-[1.2em]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <g
                                fill="currentColor"
                                strokeLinejoin="miter"
                                strokeLinecap="butt"
                            >
                                <polyline
                                    points="3 14 9 14 9 17 15 17 15 14 21 14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"
                                ></polyline>
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="square"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"
                                ></rect>
                            </g>
                        </svg>
                        <span className="dock-label">Inbox</span>
                    </Link>

                    <Link
                        href={"/settings"}
                        className={`${
                            activeLink === "settings" ? "dock-active" : ""
                        }`}
                    >
                        <svg
                            className="size-[1.2em]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <g
                                fill="currentColor"
                                strokeLinejoin="miter"
                                strokeLinecap="butt"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="square"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"
                                ></circle>
                                <path
                                    d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="square"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"
                                ></path>
                            </g>
                        </svg>
                        <span className="dock-label">Settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
