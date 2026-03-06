import { User } from "lucide-react";
import { authClient } from "@/app/routes/auth/lib/auth-client";
import { getImageUrl } from "@/lib/image.client";
import { Card } from "../ui/card";

// TODO: tRPC 연동 후 백엔드 스키마로 대체 예정
interface Story {
	id: string;
	username: string;
	avatar: string;
}

// TODO: 백엔드 연동 후 실제 데이터로 대체 예정
const mockStories: Story[] = [
	{
		id: "1",
		username: "johndoe",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
	},
	{
		id: "2",
		username: "janedoe",
		avatar:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face",
	},
	{
		id: "3",
		username: "photographer",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
	},
	{
		id: "4",
		username: "traveler",
		avatar:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
	},
	{
		id: "5",
		username: "foodie",
		avatar:
			"https://images.unsplash.com/photo-1463453091185-61582044d556?w=60&h=60&fit=crop&crop=face",
	},
];
export default function Stories() {
	const { data: session } = authClient.useSession();
	return (
		<Card className="p-4">
			<div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
				<div className="flex flex-col items-center space-y-1 flex-shrink-8">
					<div className="relative">
						<div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 to-fuchsia-600 bg-gray-200">
							{session?.user.image ? (
								<img
									src={getImageUrl(session?.user.image)}
									alt="Your profile avatar"
									className="w-16 h-16 rounded-full object-cover border-2 border-white"
								/>
							) : (
								<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
									<User className="h-6 w-6 text-muted-foreground" />
								</div>
							)}
						</div>
					</div>
					<span className="text-xs text-center w-16 truncate" title="Your story">
						Your Story
					</span>
				</div>
				{mockStories.map((story) => (
					<div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-8">
						<div className="relative">
							<div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 to-fuchsia-600 bg-gray-200">
								<img
									src={story.avatar}
									alt={story.username}
									className="w-16 h-16 rounded-full object-cover border-2 border-white"
								/>
							</div>
						</div>
						<span className="text-xs text-center w-16 truncate" title={story.username}>
							{story.username}
						</span>
					</div>
				))}
			</div>
		</Card>
	);
}
