import { Component, type ErrorInfo, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { CinematicIntro } from "@/components/intro/CinematicIntro";

class IntroErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
	constructor(props: { children: ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError(): { hasError: boolean } {
		return { hasError: true };
	}
	componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
		console.error("Cinematic intro failed to render:", error, errorInfo);
	}
	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-black text-foreground">
					<Navbar />
					<main className="min-h-screen flex items-center justify-center px-6 text-center">
						<div>
							<h1 className="font-display text-5xl sm:text-6xl md:text-8xl tracking-[0.22em] uppercase">DWINDIK</h1>
							<p className="mt-6 font-body text-[11px] sm:text-xs tracking-[0.45em] uppercase text-foreground/70">Cre8te</p>
						</div>
					</main>
				</div>
			);
		}
		return this.props.children;
	}
}

const Index = () => (
	<IntroErrorBoundary>
		<CinematicIntro />
	</IntroErrorBoundary>
);

export default Index;
