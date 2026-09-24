import React from 'react';
import Dashboard from './Dashboard.jsx';

function Main() {
    return (
        <main className="relative w-full min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-16">
            {/* Decentní ambientní pozadí */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-emerald-50/40 via-slate-50/20 to-transparent"/>

            <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex flex-col gap-8">
                {/* Titulek */}
                <section className="flex flex-col gap-1 border-b border-slate-200/60 pb-6 sm:pb-8">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"/>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Osobní rozpočet</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                        Rozpočtovač
                    </h1>

                    <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
                        Automatické rozdělení peněžního toku podle vašich pravidel
                    </p>
                </section>

                {/* Dashboard s kartami */}
                <div className="w-full">
                    <Dashboard/>
                </div>
            </div>
        </main>
    );
}
export default Main;