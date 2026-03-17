import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getImageUrl } from "@/lib/image.client";
import { useTRPC } from "@/lib/trpc/client";
import { authClient } from "../../auth/lib/auth-client";

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
	const { data: session } = authClient.useSession();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
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
	const invalidateQueries = () => {
		queryClient.invalidateQueries({
			queryKey: trpc.usersRouter.getFollowers.queryKey(),
		});
		queryClient.invalidateQueries({
			queryKey: trpc.usersRouter.getFollowings.queryKey(),
		});
		queryClient.invalidateQueries({
			queryKey: trpc.usersRouter.getUserProfile.queryKey(),
		});
	};
	const followMutation = useMutation(
		trpc.usersRouter.follow.mutationOptions({
			onSuccess: invalidateQueries,
		}),
	);
	const unfollowMutation = useMutation(
		trpc.usersRouter.unfollow.mutationOptions({
			onSuccess: invalidateQueries,
		}),
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
										className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden h-auto p-0 justify-start"
									>
										{user.image ? (
											<img
												src={getImageUrl(user.image)}
												alt={user.name}
												width={40}
												height={40}
												className="w-10 h-10 rounded-full object-cover"
											/>
										) : (
											<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
												<User className="w-5 h-5 text-muted-foreground" />
											</div>
										)}
										<div className="flex-1 min-w-0 text-left">
											<div className="font-semibold text-sm truncate">{user.name}</div>
											{user.bio && (
												<div className="text-xs text-muted-foreground truncate">{user.bio}</div>
											)}
										</div>
									</Button>
									{session?.user.id !== user.id && (
										<Button
											variant={user.isFollowing ? "outline" : "default"}
											size={"sm"}
											onClick={() => {
												if (user.isFollowing) {
													unfollowMutation.mutate({ userId: user.id });
												} else {
													followMutation.mutate({ userId: user.id });
												}
											}}
											disabled={followMutation.isPending || unfollowMutation.isPending}
											className="shrink-0"
										>
											{user.isFollowing ? "Unfollow" : "Follow"}
										</Button>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
