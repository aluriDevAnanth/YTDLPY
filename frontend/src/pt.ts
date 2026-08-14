export const pt = {
    dialog: {
        root: { className: "w-[90vw] h-[90vh]" },
        header: { className: "p-2" },
        content: { className: "flex flex-col h-full overflow-hidden p-0 px-2" },
    },

};

export const globalPT = {
    tooltip: {
        root: { className: "pointer-events-none z-[99999]" },
        text: {
            className:
                "bg-[#18181b]/95 dark:bg-[#18181b]/95 text-gray-100 font-sans text-[11px] font-medium leading-tight px-2.5 py-1 rounded-lg shadow-xl border border-gray-200/20 dark:border-none backdrop-blur-md transition-all",
        },
    },
    toast: {
        root: { className: "w-72 sm:w-80 text-xs z-[99999]" },
        message: {
            className:
                "my-0.5 rounded-xl shadow-lg backdrop-blur-md border border-gray-200/40 dark:border-none overflow-hidden transition-all duration-200",
        },
        content: {
            className:
                "flex items-center px-2.5 py-2 sm:px-3 sm:py-2 gap-2 bg-white/95 dark:bg-[#18181b]/95 text-gray-900 dark:text-gray-100",
        },
        icon: {
            className: "size-8 shrink-0",
        },
        text: {
            className: "flex flex-col gap-0 min-w-0 grow leading-tight",
        },
        summary: {
            className: "font-semibold text-xs text-gray-900 dark:text-white leading-tight truncate",
        },
        detail: {
            className: "text-[11px] text-gray-600 dark:text-gray-300 leading-tight mt-0.5",
        },
        closeButton: {
            className:
                "size-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-0 border-0 bg-transparent shrink-0 cursor-pointer ml-auto",
        },
        closeIcon: {
            className: "text-xs",
        },
    },
}