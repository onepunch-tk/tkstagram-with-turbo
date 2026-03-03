import { authClient } from "@/app/routes/auth/lib/auth-client";
import { Card } from "../ui/card";

export default function SideBar() {
	const { data: session } = authClient.useSession();
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
				</div>
			</Card>
		</div>
	);
}
