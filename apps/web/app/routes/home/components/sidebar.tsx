import { useQueryClient } from "@tanstack/react-query";
import { Camera, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "@/app/routes/auth/lib/auth-client";
import ThemeToggle from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image.client";
import { useTRPC } from "@/lib/trpc/client";
import AvatarUpload from "./avatar-upload";

interface SuggestedUser {
	id: string;
	username: string;
	avatar: string;
	followedBy: string;
}

const mockSuggestions: SuggestedUser[] = [
	{
		id: "1",
		username: "alexsmith",
		avatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
		followedBy: "johndoe",
	},
	{
		id: "2",
		username: "sarahwilson",
		avatar:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
		followedBy: "janedoe",
	},
	{
		id: "3",
		username: "mikejohnson",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
		followedBy: "photographer",
	},
	{
		id: "4",
		username: "emilydavis",
		avatar:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
		followedBy: "photographer",
	},
	{
		id: "5",
		username: "davidbrown",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
		followedBy: "traveler",
	},
];

// 사이드바: 유저 프로필, 테마 토글, 로그아웃
export default function SideBar() {
	const { data: session } = authClient.useSession();
	const [showAvatarModal, setShowAvatarModal] = useState(false);
	const navigate = useNavigate();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// JWT 세션 쿠키 제거 후 로그인 페이지로 리다이렉트
	const handleLogout = async () => {
		await authClient.signOut();
		navigate("/login");
	};

	const handleAvatarUpload = async (file: File) => {
		const formData = new FormData();
		formData.append("image", file);

		const uploadResponse = await fetch("/api/upload/image", {
			method: "POST",
			body: formData,
		});

		if (!uploadResponse.ok) {
			throw new Error("Failed to upload avatar");
		}

		const { filename } = await uploadResponse.json();
		await authClient.updateUser({ image: filename });
		await queryClient.invalidateQueries(trpc.postsRouter.findAll.queryOptions());
	};

	return (
		<div className="space-y-6">
			<Card className="p-4">
				<div className="flex items-center space-x-3 mb-4">
					<div className="relative">
						{session?.user.image ? (
							<img
								src={getImageUrl(session.user.image)}
								alt="Your profile"
								width={60}
								height={60}
								className="w-14 h-14 rounded-full"
							/>
						) : (
							<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
								<User className="h-4 w-4 text-muted-foreground" />
							</div>
						)}
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowAvatarModal(true)}
							title="Change avatar"
							className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/90"
						>
							<Camera className="w-3 h-3" />
						</Button>
					</div>

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

			<Card className="p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-semibold text-muted-foreground">Suggestions for you</h3>
				</div>
				<div className="space-y-3">
					{mockSuggestions.map((user) => (
						<div key={user.id} className="flex items-center space-x-3">
							<img
								src={user.avatar}
								alt={user.username}
								className="w-8 h-8 rounded-full"
								width={40}
								height={40}
							/>
							<div className="flex-1 min-w-0">
								<div className="font-semibold text-sm">{user.username}</div>
								{user.followedBy && (
									<div className="text-xs text-muted-foreground">Followed by {user.followedBy}</div>
								)}
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="text-primary hover:text-primary/90 text-xs"
							>
								Follow
							</Button>
						</div>
					))}
				</div>
			</Card>

			<AvatarUpload
				open={showAvatarModal}
				onOpenChange={setShowAvatarModal}
				onSubmit={handleAvatarUpload}
				currentAvatar={session?.user.image}
			/>
		</div>
	);
}
