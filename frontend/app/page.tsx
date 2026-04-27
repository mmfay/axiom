export default function Home() {
	
	const features = [
		{
			title: "Finance that stays traceable",
			description:
				"General ledger, journals, dimensions, and controls designed so teams can move faster without losing auditability.",
			icon: "📘",
		},
		{
			title: "Operations connected in one flow",
			description:
				"Bring inventory, users, workflow, and approvals into the same system instead of stitching together disconnected tools.",
			icon: "⚙️",
		},
		{
			title: "Built with AI in mind",
			description:
				"Axiom is designed for embedded assistance, guided workflows, and smarter actions on top of your ERP data.",
			icon: "✨",
		},
	];

	const highlights = [
		"Role-based access and secure sign-in",
		"Fast workflows for finance and operations",
		"Modern UI built for daily work, not occasional reporting",
		"Designed to scale from internal teams to full SaaS architecture",
	];

	return (
		<main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_25%)]" />

				<div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-6 sm:px-8 lg:px-10">
					<header className="flex items-center justify-between rounded-full border border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-lg font-semibold text-slate-900 shadow-lg shadow-blue-500/10 dark:bg-white/10 dark:text-white">
								A
							</div>
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-200/90">
									Axiom
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-300">
									Modern ERP foundation
								</p>
							</div>
						</div>

						<nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex dark:text-slate-300">
							<a href="#features" className="transition hover:text-slate-950 dark:hover:text-white">
								Features
							</a>
							<a href="#why-axiom" className="transition hover:text-slate-950 dark:hover:text-white">
								Why Axiom
							</a>
							<a href="#security" className="transition hover:text-slate-950 dark:hover:text-white">
								Security
							</a>
						</nav>

						<div className="flex items-center gap-3">
							<a
								href="/login"
								className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:border-white/30 dark:hover:bg-white/5"
							>
								Sign in
							</a>
							<a
								href="/signup"
								className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
							>
								Get started
							</a>
						</div>
					</header>

					<div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
						<div className="max-w-3xl">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-100">
								<span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-300" />
								ERP workflows, rebuilt for speed and control
							</div>

							<h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
								One operating system for
								<span className="block bg-gradient-to-r from-blue-600 via-slate-900 to-violet-600 bg-clip-text text-transparent dark:from-blue-300 dark:via-white dark:to-violet-300">
									finance, operations, and AI.
								</span>
							</h1>

							<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
								Axiom is a modern ERP platform designed to help teams manage core business
								processes with better visibility, stronger controls, and a user experience
								people actually want to use.
							</p>

							<div className="mt-10 flex flex-col gap-4 sm:flex-row">
								<a
									href="/signup"
									className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 dark:bg-blue-500 dark:shadow-blue-500/30 dark:hover:bg-blue-400"
								>
									Create account
								</a>
								<a
									href="/login"
									className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/10"
								>
									Sign in to Axiom
								</a>
							</div>

							<div className="mt-10 grid gap-3 sm:grid-cols-2">
								{highlights.map((item) => (
									<div
										key={item}
										className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
									>
										<span className="mt-0.5 text-emerald-600 dark:text-emerald-300">✓</span>
										<span>{item}</span>
									</div>
								))}
							</div>
						</div>

						<div className="relative">
							<div className="absolute -inset-6 rounded-[2rem] bg-blue-500/10 blur-3xl" />
							<div className="relative rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/30">
								<div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/90">
									<div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
										<div>
											<p className="text-sm text-slate-500 dark:text-slate-400">Workspace</p>
											<h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
												Axiom Command Center
											</h2>
										</div>
										<div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
											Secure session
										</div>
									</div>

									<div className="mt-5 grid gap-4">
										<div className="grid gap-4 sm:grid-cols-2">
											<div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
												<p className="text-sm text-slate-500 dark:text-slate-400">
													Open journals
												</p>
												<p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
													18
												</p>
												<p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">
													+4 ready to review
												</p>
											</div>
											<div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
												<p className="text-sm text-slate-500 dark:text-slate-400">
													Pending approvals
												</p>
												<p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
													7
												</p>
												<p className="mt-2 text-sm text-amber-600 dark:text-amber-300">
													2 high priority
												</p>
											</div>
										</div>

										<div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm text-slate-500 dark:text-slate-400">
														Assistant suggestions
													</p>
													<p className="mt-1 font-medium text-slate-900 dark:text-white">
														Recommended next actions
													</p>
												</div>
												<span className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
													AI enabled
												</span>
											</div>

											<div className="mt-4 space-y-3">
												{[
													"3 journals are ready for posting after validation.",
													"A new warehouse location was added and needs review.",
													"User permissions changed for 2 accounts today.",
												].map((message) => (
													<div
														key={message}
														className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
													>
														{message}
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="features" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
						Core platform
					</p>
					<h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
						Built for how teams actually run the business
					</h2>
					<p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
						Axiom combines strong process control with a cleaner interface and a
						foundation that can support future workflow and AI capabilities.
					</p>
				</div>

				<div className="mt-12 grid gap-6 lg:grid-cols-3">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-white/5 dark:shadow-black/10"
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-white/10">
								{feature.icon}
							</div>
							<h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
								{feature.title}
							</h3>
							<p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="border-y border-slate-200 bg-slate-100/70 dark:border-white/10 dark:bg-white/[0.03]" id="why-axiom">
				<div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:px-10">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
							Why Axiom
						</p>
						<h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
							Designed to feel modern without sacrificing ERP discipline
						</h2>
						<p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
							Most ERP systems ask users to tolerate outdated workflows and cluttered
							screens. Axiom is designed to keep the operational rigor while improving
							clarity, speed, and extensibility.
						</p>
					</div>

					<div className="grid gap-4">
						{[
							{
								title: "Clear role separation",
								description:
									"Support secure access patterns across finance, operations, and administration.",
							},
							{
								title: "Workflow-ready architecture",
								description:
									"Lay the groundwork for approvals, status transitions, and guided actions across modules.",
							},
							{
								title: "Extensible product foundation",
								description:
									"Built to support custom modules, integrations, and future platform growth.",
							},
						].map((item) => (
							<div
								key={item.title}
								className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70"
							>
								<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
									{item.title}
								</h3>
								<p className="mt-2 text-slate-600 dark:text-slate-300">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="security" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
				<div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-8 shadow-2xl shadow-slate-200/60 lg:p-10 dark:border-white/10 dark:from-slate-900 dark:to-slate-950 dark:shadow-black/20">
					<div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
								Security first
							</p>
							<h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
								Secure by design, not bolted on later
							</h2>
							<p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
								Axiom is built around permission-aware workflows, protected application
								areas, and backend-enforced controls so teams can work confidently with
								sensitive operational and financial data.
							</p>
						</div>

						<div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
							<ul className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
								{[
									"Protected and public application boundaries",
									"Role and permission-based access patterns",
									"Audit-ready workflow foundations",
									"Backend-enforced security for critical actions",
								].map((item) => (
									<li key={item} className="flex items-start gap-3">
										<span className="mt-0.5 text-emerald-600 dark:text-emerald-300">●</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			<footer className="border-t border-slate-200 px-6 py-8 text-sm text-slate-500 sm:px-8 lg:px-10 dark:border-white/10 dark:text-slate-400">
				<div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} Axiom. Modern ERP foundation.</p>
					<div className="flex items-center gap-5">
						<a href="/login" className="transition hover:text-slate-900 dark:hover:text-white">
							Sign in
						</a>
						<a href="/signup" className="transition hover:text-slate-900 dark:hover:text-white">
							Create account
						</a>
					</div>
				</div>
			</footer>
		</main>
	);
}