import type { Route } from "./+types/home";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* 메인 레이아웃: 모바일 1열, 대형화면 3열 그리드 */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* 메인 콘텐츠 영역 (2열 차지) - Stories + Feed */}
					<div className="lg:col-span-2 space-y-6">
						{/* Stories 컴포넌트 자리 */}
						<div></div>
						{/* Feed 컴포넌트 자리 */}
						<div></div>
					</div>
					{/* 사이드바 영역 - 대형화면에서 스크롤 시 고정 */}
					<div className="lg:sticky lg:top-8 lg:h-fit">
						<div></div>
					</div>
				</div>
			</div>
		</div>
	);
}
