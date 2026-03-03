import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { authClient } from "@/app/routes/auth/lib/auth-client";
import ThemeToggle from "../theme/theme-toggle";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

// 사이드바: 유저 프로필, 테마 토글, 로그아웃
export default function SideBar() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	// JWT 세션 쿠키 제거 후 로그인 페이지로 리다이렉트
	const handleLogout = async () => {
		await authClient.signOut();
		navigate("/login");
	};

	return (
		<div className="space-y-6">
			<Card className="p-4">
				<div className="flex items-center space-x-3 mb-4">
					<img
						src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face"
						alt="Your profile"
						width={60}
						height={60}
						className="w-14 h-14 rounded-full"
					/>
					<div className="flex-1 min-w-0">
						<div className="font-semibold truncate">{session?.user.email}</div>
						<div className="text-sm text-muted-foreground truncate">{session?.user.name}</div>
					</div>
					<div className="flex items-center gap-1 sm:gap-2 shrink-0">
						<ThemeToggle />
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-foreground"
							onClick={handleLogout}
							title="Sign Out"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
