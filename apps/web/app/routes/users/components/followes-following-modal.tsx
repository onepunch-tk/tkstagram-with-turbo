import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTRPC } from "@/lib/trpc/client";

interface FollowersFollowingModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	type: "followers" | "following";
}

export default function FollowersFollowingModal({
	open,
	onOpenChange,
	userId,
	type,
}: FollowersFollowingModalProps) {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const { data: followers = [] } = useQuery(
		trpc.usersRouter.getFollowers.queryOptions(
			{ userId },
			{
				enabled: open && type === "followers",
			},
		),
	);
	const { data: following = [] } = useQuery(
		trpc.usersRouter.getFollowings.queryOptions(
			{ userId },
			{
				enabled: open && type === "following",
			},
		),
	);
	const users = type === "followers" ? followers : following;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{type === "followers" ? "Followers" : "Following"}</DialogTitle>
				</DialogHeader>
				<div className="max-h-[60vh] overflow-y-auto">
					{users.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">
							No {type === "followers" ? "followers" : "following"} yet
						</p>
					) : (
						<div className="space-y-3">
							{users.map((user) => (
								<div key={user.id} className="flex items-center justify-between">
									<Button
										variant={"ghost"}
										onClick={() => {
											navigate(`/users/${user.id}`);
											onOpenChange(false);
										}}
										className="flex items-center space-x-3 flex-1 h-auto p-0 justify-start"
									></Button>
								</div>
							))}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
