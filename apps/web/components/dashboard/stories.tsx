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
		id: "your_story",
		username: "Your Story",
		avatar:
			"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face",
	},
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
	return (
		<Card className="p-4">
			<div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
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
