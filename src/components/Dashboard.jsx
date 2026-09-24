import React, { useState, useEffect } from "react";
import MonthlyIncomeCard from "./MonthlyIncomeCard";
import PeriodActionBar from "./PeriodActionBar";
import BudgetOverviewMetrics from "./BudgetOverviewMetrics";
import BudgetDistribution from "./BudgetDistribution";
import MonthlyActionPlan from "./MonthlyActionPlan";

export default function Dashboard() {
    // Příjem a měna
    const [income, setIncome] = useState(() => Number(localStorage.getItem("budget_income")) || 15000);
    const [currency, setCurrency] = useState(() => localStorage.getItem("budget_currency") || "CZK");

    useEffect(() => {
        localStorage.setItem("budget_income", income.toString());
    }, [income]);

    useEffect(() => {
        localStorage.setItem("budget_currency", currency);
    }, [currency]);

    // Procenta
    const [percentages, setPercentages] = useState(() => {
        const saved = localStorage.getItem("budget_percentages");
        return saved ? JSON.parse(saved) : { investments: 20, mandatory: 50, pocket: 30 };
    });

    useEffect(() => {
        localStorage.setItem("budget_percentages", JSON.stringify(percentages));
    }, [percentages]);

    // Datový model položek (předvyplněno přesně podle předlohy)
    const [budgetItems, setBudgetItems] = useState(() => {
        const saved = localStorage.getItem("budget_items");
        return saved
            ? JSON.parse(saved)
            : {
                investments: [
                    { id: 1, name: "ETF (70 % z balíku)", amount: 2101, isPaid: false },
                    { id: 2, name: "Spořicí účet (30 % z balíku)", amount: 900, isPaid: false },
                ],
                mandatory: [
                    { id: 3, name: "Internet + Data", amount: 800, isPaid: false },
                    { id: 4, name: "Autopojištění", amount: 1400, isPaid: false },
                    { id: 5, name: "Fitko", amount: 1300, isPaid: false },
                    { id: 6, name: "MHD", amount: 130, isPaid: false },
                ],
                pocket: [],
            };
    });

    useEffect(() => {
        localStorage.setItem("budget_items", JSON.stringify(budgetItems));
    }, [budgetItems]);

    // API kurzy
    const [exchangeRates, setExchangeRates] = useState({ CZK: 1, USD: 21.41, EUR: 24.398 });
    const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleString("cs-CZ"));
    const [ratesLoading, setRatesLoading] = useState(false);

    const fetchRates = async () => {
        try {
            setRatesLoading(true);
            const res = await fetch("https://open.er-api.com/v6/latest/CZK");
            const data = await res.json();
            if (data && data.rates) {
                setExchangeRates({
                    CZK: 1,
                    USD: Number((1 / data.rates.USD).toFixed(2)),
                    EUR: Number((1 / data.rates.EUR).toFixed(3)),
                });
                setLastUpdated(new Date().toLocaleString("cs-CZ"));
            }
        } finally {
            setRatesLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const totalInCzk = Math.round(income * (exchangeRates[currency] || 1));

    // Akce: Převést přebytek z mandatorních do investic
    const handleTransferSurplusToInvestments = (surplusAmount) => {
        setBudgetItems((prev) => ({
            ...prev,
            investments: [
                ...prev.investments,
                {
                    id: Date.now(),
                    name: "Převod z přebytku mandatorních",
                    amount: surplusAmount,
                    isPaid: false,
                },
            ],
        }));
    };

    return (
        <section className="w-full flex flex-col gap-6 text-slate-800 max-w-7xl mx-auto px-4 py-8">
            {/* 1. Měsíční příjem */}
            <MonthlyIncomeCard
                income={income}
                setIncome={setIncome}
                currency={currency}
                setCurrency={setCurrency}
                totalInCzk={totalInCzk}
            />

            {/* 2. Období a akční lišta */}
            <PeriodActionBar
                income={income}
                currency={currency}
                totalInCzk={totalInCzk}
                exchangeRates={exchangeRates}
                setExchangeRates={setExchangeRates}
                ratesLoading={ratesLoading}
                lastUpdated={lastUpdated}
                onRefreshRates={fetchRates}
            />

            {/* 3. Karty souhrnu a stavů (přímo propojené s budgetItems) */}
            <BudgetOverviewMetrics
                income={income}
                currency={currency}
                totalInCzk={totalInCzk}
                percentages={percentages}
                budgetItems={budgetItems}
            />

            {/* 4. Analytická sekce rozpočtu */}
            <BudgetDistribution
                totalInCzk={totalInCzk}
                percentages={percentages}
                setPercentages={setPercentages}
            />

            {/* 5. Měsíční plán, další kroky a detailní položky */}
            <MonthlyActionPlan
                totalInCzk={totalInCzk}
                percentages={percentages}
                budgetItems={budgetItems}
                setBudgetItems={setBudgetItems}
                onTransferSurplusToInvestments={handleTransferSurplusToInvestments}
            />
        </section>
    );
}