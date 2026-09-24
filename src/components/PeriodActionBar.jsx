import React, { useState, useEffect , useRef} from "react";

const MONTHS = [
    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
    "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
];

export default function PeriodActionBar({ income,
                                            currency,
                                            totalInCzk,
                                            exchangeRates,
                                            setExchangeRates,
                                            ratesLoading,
                                            lastUpdated,
                                            onRefreshRates
}) {
    // 1. Stav vybraného období načtený z paměti prohlížeče
    const [selectedMonth, setSelectedMonth] = useState(() => {
        return localStorage.getItem("budget_period_month") || "Říjen";
    });

    const [selectedYear, setSelectedYear] = useState(() => {
        return Number(localStorage.getItem("budget_period_year")) || 2026;
    });

    // Stav a ref pro vyskakovací okno kurzů
    const [showRatesModal, setShowRatesModal] = useState(false);
    const modalRef = useRef(null);

    // Zavření okna při kliknutí mimo
    useEffect(() => {
        function handleClickOutside(e) {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setShowRatesModal(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Ukládání změn období do paměti
    useEffect(() => {
        localStorage.setItem("budget_period_month", selectedMonth);
    }, [selectedMonth]);

    useEffect(() => {
        localStorage.setItem("budget_period_year", selectedYear.toString());
    }, [selectedYear]);

    // Ruční úprava kurzu v inputu
    const handleRateChange = (curr, value) => {
        if (!setExchangeRates) return;
        setExchangeRates((prev) => ({
            ...prev,
            [curr]: Number(value) || 0
        }));
    };

    // Formátování částek pro spodní informační text
    const formattedIncome = new Intl.NumberFormat("cs-CZ").format(income);
    const formattedCzk = new Intl.NumberFormat("cs-CZ").format(totalInCzk);
    const currencySymbol = currency === "CZK" ? "Kč" : currency === "EUR" ? "€" : "$";

    // --- BUSINESS LOGIKA: EXPORTY A HISTORIE ---

    const handleSaveToHistory = () => {
        const historyEntry = {
            id: `${selectedMonth}-${selectedYear}`,
            month: selectedMonth,
            year: selectedYear,
            income,
            currency,
            totalInCzk,
            savedAt: new Date().toISOString(),
        };

        const existingHistory = JSON.parse(localStorage.getItem("budget_history") || "[]");
        const updatedHistory = [
            ...existingHistory.filter((item) => item.id !== historyEntry.id),
            historyEntry,
        ];

        localStorage.setItem("budget_history", JSON.stringify(updatedHistory));
        alert(`Měsíc ${selectedMonth} ${selectedYear} byl úspěšně uložen do historie.`);
    };

    const handleExportJSON = () => {
        const data = {
            month: selectedMonth,
            year: selectedYear,
            income,
            currency,
            totalInCzk,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `rozpocet-${selectedMonth}-${selectedYear}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Obdobi;Prijem;Mena;Celkem_CZK\n" +
            `${selectedMonth} ${selectedYear};${income};${currency};${totalInCzk}\n`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rozpocet-${selectedMonth}-${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <div className="w-full bg-white border border-slate-200/80 rounded-2xl px-6 py-4 shadow-sm flex flex-col gap-4">
            {/* Horní řádek s ovládacími prvky */}
            <div className="flex flex-wrap items-center justify-between gap-4">

                {/* Výběr období vlevo */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mr-2"> OBDOBÍ: </span>
                    <div className="relative">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className=" w-50appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-700 font-medium outline-none cursor-pointer hover:bg-slate-50">
                            {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-xs text-center font-medium text-slate-700 outline-none hover:bg-slate-50"/>
                </div>

                {/* Tlačítková lišta vpravo */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">

                    {/* Uložit měsíc */}
                    <button
                        onClick={handleSaveToHistory}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-4 shadow-xs transition-colors cursor-pointer">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                        </svg>
                        Uložit měsíc do historie
                    </button>

                    {/* Export do PDF */}
                    <button onClick={handlePrintPDF} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-4 transition-colors cursor-pointer">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>

                        Export do PDF
                    </button>

                    {/* CSV */}
                    <button
                        onClick={handleExportCSV}
                        className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        CSV
                    </button>

                    {/* JSON */}
                    <button
                        onClick={handleExportJSON}
                        className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 7v10c0 2 1.5 3 3.5 3s3.5-1 3.5-3V7c0-2-1.5-3-3.5-3S4 5 4 7zm10 0v10c0 2 1.5 3 3.5 3s3.5-1 3.5-3V7c0-2-1.5-3-3.5-3s-3.5 1-3.5 3z"/>
                        </svg>
                        JSON
                    </button>

                    {/* TLAČÍTKO KURZY + VYSKAKOVACÍ OKNO */}
                    <div className="relative" ref={modalRef}>
                        <button
                            onClick={() => setShowRatesModal((prev) => !prev)}
                            title="Klikněte pro zobrazení kurzů"
                            className={`border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                                showRatesModal ? "bg-slate-100 border-slate-300" : ""
                            }`}
                        >
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                            </svg>
                            Kurzy
                        </button>

                        {/* POPOVER OKNO S KURZY */}
                        {showRatesModal && (
                            <div
                                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl p-5 shadow-2xl border border-slate-200/90 z-50 flex flex-col gap-4 text-slate-800 animate-in fade-in duration-100">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                                        Kurzy měn (základ CZK)
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Hodnota 1 jednotky přepočtená na Kč
                                    </p>
                                </div>

                                {/* 1 EUR */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-slate-700 text-sm">1 EUR =</span>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={exchangeRates?.EUR ?? ""}
                                            onChange={(e) => handleRateChange("EUR", e.target.value)}
                                            className="w-24 border border-slate-300 rounded-lg px-2.5 py-1.5 text-right font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                                        />
                                        <span className="text-slate-400 font-normal">Kč</span>
                                    </div>
                                </div>

                                {/* 1 USD */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-slate-700 text-sm">1 USD =</span>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={exchangeRates?.USD ?? ""}
                                            onChange={(e) => handleRateChange("USD", e.target.value)}
                                            className="w-24 border border-slate-300 rounded-lg px-2.5 py-1.5 text-right font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                                        />
                                        <span className="text-slate-400 font-normal">Kč</span>
                                    </div>
                                </div>

                                {/* Spodní stav: Live datum a tlačítko Z API */}
                                <div
                                    className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                                    <span className="text-slate-400">
                                        Live: {lastUpdated}
                                    </span>

                                    <button
                                        onClick={onRefreshRates}
                                        disabled={ratesLoading}
                                        className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer disabled:opacity-50">
                                        <svg
                                            className={`w-3.5 h-3.5 text-slate-600 ${ratesLoading ? "animate-spin" : ""}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                        </svg>
                                        Z API
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Historie */}
                    <button onClick={() => { const hist = localStorage.getItem("budget_history"); alert(hist ? `Uložená historie:\n${hist}` : "Zatím žádná uložená historie.");}}

                        className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Historie
                    </button>
                </div>

            </div>

            {/* Spodní informační řádek */}
            <div className="text-[11px] text-slate-400 mt-1">
                Aktuální přehled pro:{" "}
                <span className="font-bold text-slate-700">
                    {selectedMonth} {selectedYear}
                </span>
                {" · "}
                příjem {formattedIncome} {currencySymbol}
                {currency !== "CZK" && ` (~${formattedCzk} Kč)`}
            </div>
        </div>
    );
}