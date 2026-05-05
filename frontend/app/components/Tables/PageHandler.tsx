type PageHandlerProps = {
	pageLength: number;
	prevOnClick: () => void;
	showPrev: boolean;
	nextOnClick: () => void;
	showNext: boolean;
	loading: boolean;
	pageNumber: number;
};

const baseBtn = "h-9 px-3 rounded-lg border text-gray-800 dark:text-slate-100 transition select-none";

const enabledBtn = "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 active:scale-[0.98]";

const disabledBtn = "border-gray-100 dark:border-white/5 bg-transparent dark:bg-white/0 text-gray-400 dark:text-slate-400 opacity-60 cursor-not-allowed";

export default function PageHandler({
	pageLength,
	prevOnClick,
	showPrev,
	nextOnClick,
	showNext,
	loading,
	pageNumber,
}: PageHandlerProps) {

	// nothing to return if there are no pages
	if (pageLength <= 0) return null;

	// disabling prev/next buttons based on pages
	const prevDisabled = !showPrev || loading;
	const nextDisabled = !showNext || loading;

	return (
		<div className="flex items-center gap-2">
			{/* Previous Page Button */}
			<button
				type="button"
				onClick={prevOnClick}
				disabled={prevDisabled}
				className={[
				baseBtn,
				prevDisabled ? disabledBtn : enabledBtn,
				].join(" ")}
			>
				Prev
			</button>

			{/* Page Number Label */}
			<h1 className="text-gray-700 dark:text-slate-200">Page {pageNumber}</h1>

			{/* Next Page Button */}
			<button
				type="button"
				onClick={nextOnClick}
				disabled={nextDisabled}
				className={[
				baseBtn,
				nextDisabled ? disabledBtn : enabledBtn,
				].join(" ")}
			>
				Next
			</button>
		</div>
	);
}
