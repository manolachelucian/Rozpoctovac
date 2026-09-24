import React, { useRef, useEffect } from "react";

export default function CurrencyModal({
                                          isOpen,
                                          onClose,
                                          exchangeRates,
                                          setExchangeRates,
                                          lastUpdated,
                                          ratesLoading,
                                          onRefreshRates
                                      }) {
    const modalRef = useRef(null);

    // Zavření při kliknutí mimo okno
    useEffect(() => {
        function handleClickOutside(e) {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleRateChange = (curr, value) => {
        setExchangeRates((prev) => ({
            ...prev,
            [curr]: Number(value) || 0
        }));
    };

    return (
        <div
            ref={modalRef}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl p-5 shadow-2xl border border-slate-200/90 z-50 flex flex-col gap-4 text-slate-800"
        >
            <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    Kurzy měn (základ CZK)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                    Hodnota 1 jednotky přepočtená na Kč
                </p>
            </div>

            {/* EUR */}
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 text-sm">1 EUR =</span>
                <div className="flex items-center gap-1.5">
                    <input
                        type="number"
                        step="0.001"
                        value={exchangeRates.EUR}
                        onChange={(e) => handleRateChange("EUR", e.target.value)}
                        className="w-24 border border-slate-300 rounded-lg px-2.5 py-1.5 text-right font-medium text-slate-900 outline-none focus:border-blue-500 text-sm"
                    />
                    <span className="text-slate-400">Kč</span>
                </div>
            </div>

            {/* USD */}
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 text-sm">1 USD =</span>
                <div className="flex items-center gap-1.5">
                    <input
                        type="number"
                        step="0.01"
                        value={exchangeRates.USD}
                        onChange={(e) => handleRateChange("USD", e.target.value)}
                        className="w-24 border border-slate-300 rounded-lg px-2.5 py-1.5 text-right font-medium text-slate-900 outline-none focus:border-blue-500 text-sm"
                    />
                    <span className="text-slate-400">Kč</span>
                </div>
            </div>

            {/* Spodní řádek */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">Live: {lastUpdated}</span>
                <button
                    onClick={onRefreshRates}
                    disabled={ratesLoading}
                    className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer disabled:opacity-50"
                >
                    <span className={ratesLoading ? "animate-spin" : ""}>🔄</span>
                    Z API
                </button>
            </div>
        </div>
    );
}