"use client"
import Image from "next/image";
import { useState } from "react";

export default function SpeedDial() {
    const [isOpen, setIsOpen] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });

    const handleChangePage = async (page) => {
        if (page === "/auth/login") {
            await fetch("/api/auth/logout", { method: "POST" });
        }
        document.location.href = page;
    }

    const handleMouseEnter = (e, name) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            show: true,
            text: name,
            x: -rect.width,
            y: rect.top - rect.height /2
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, show: false });
    };

    const menuList = [
        {
            name: "Dashboard",
            link: "/",
            icone: "/icones/dashboard.png"
        },
        {
            name: "Gestion",
            link: "/gestion",
            icone: "/icones/gestion.png"
        },
        {
            name: "Modèle",
            link: "/modele",
            icone: "/icones/modele.png"
        },
        {
            name: "Déconnexion",
            link: "/auth/login",
            icone: "/icones/logout.png"
        }
    ]

    return (
        <div>
            <div
                className={`z-40 fixed top-6 end-6 group`}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <button
                    type="button"
                    aria-controls="speed-dial-menu-top-right"
                    aria-expanded={isOpen}
                    className={`flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none`}
                >
                    <svg className={`w-5 h-5 transition-transform ${isOpen ? "rotate-45" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                    </svg>
                </button>
                <div id="speed-dial-menu-top-right" className={`flex flex-col items-center mt-4 space-y-2 transition-opacity duration-500 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                    {menuList.map(el => (
                        <button
                            key={el.name}
                            onMouseEnter={(e) => handleMouseEnter(e, el.name)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleChangePage(el.link)}
                            type="button"
                            className={`flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none`}
                        >
                            <Image className={`h-6 w-6`} width={100} height={100} src={el.icone} alt={el.name} />
                        </button>
                    ))}
                </div>
                {tooltip.show && (
                    <div
                        className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm`}
                        style={{ top: `${tooltip.y}px`, left: `${tooltip.x}px`, transform: "translateX(-50%)" }}
                    >
                        <p className="flex justify-center items-center">{tooltip.text}</p>
                    </div>
                )}
            </div>
        </div>
    )
}