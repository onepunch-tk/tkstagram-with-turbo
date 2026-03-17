import type { Post, UpdateProfileInput } from "@repo/trpc/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import { useTRPC } from "@/lib/trpc/client";
import { authClient } from "../../auth/lib/auth-client";
import EditProfileModal from "../components/edit-profile-modal";
import FollowersFollowingModal from "../components/followes-following-modal";
import PostModal from "../components/post-modal";
import ProfileHeader from "../components/profile-header";
import ProfileNavigation from "../components/profile-navigation";
import ProfileTabs from "../components/profile-tabs";

export default function Profile() {
	const { userId } = useParams<{ userId: string }>();
	const { data: session } = authClient.useSession();
	const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [followersFollowingModal, setFollowersFollowingModal] = useState<{
		open: boolean;
		type: "followers" | "following";
	}>({
		open: false,
		type: "followers",
	});
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const {
		data: profile,
		isLoading,
		isError,
	} = useQuery({
		...trpc.usersRouter.getUserProfile.queryOptions({ userId: userId as string }),
		retry: false,
	});

	const { data: posts = [] } = useQuery(trpc.postsRouter.findAll.queryOptions({ userId }));

	const unfollowMutation = useMutation(
		trpc.usersRouter.unfollow.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.usersRouter.getUserProfile.queryKey({ userId }),
				});
			},
		}),
	);

	const followMutation = useMutation(
		trpc.usersRouter.follow.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.usersRouter.getUserProfile.queryKey({ userId }),
				});
			},
		}),
	);

	const updateProfileMutation = useMutation(
		trpc.usersRouter.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.usersRouter.getUserProfile.queryKey({ userId }),
				});
			},
		}),
	);

	const handleFollowToggle = () => {
		if (!profile) {
			return;
		}
		if (profile.isFollowing) {
			unfollowMutation.mutate({ userId: profile.id });
		} else {
			followMutation.mutate({ userId: profile.id });
		}
	};

	const handlePostClick = (post: Post) => {
		setSelectedPost(post);
		setIsModalOpen(true);
	};

	const handleSaveProfile = async (data: UpdateProfileInput) => {
		await updateProfileMutation.mutateAsync(data);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (isError || !profile) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-2">User not found</h1>
					<p className="text-muted-foreground">This user doesn't exist</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<ProfileNavigation />
			<div className="max-w-4xl mx-auto px-4 py-8">
				<ProfileHeader
					onEditProfile={() => setIsEditProfileOpen(true)}
					onFollowToggle={handleFollowToggle}
					onOpenFollowers={() => setFollowersFollowingModal({ open: true, type: "followers" })}
					onOpenFollowings={() => setFollowersFollowingModal({ open: true, type: "following" })}
					isFollowLoading={followMutation.isPending || unfollowMutation.isPending}
					isOwnProfile={profile.id === session?.user.id}
					profile={profile}
				/>

				<ProfileTabs
					userPosts={posts}
					savedPosts={[]}
					name={profile.name}
					onPostClick={handlePostClick}
				/>
			</div>
			{selectedPost && (
				<PostModal open={isModalOpen} onOpenChange={setIsModalOpen} initialPost={selectedPost} />
			)}

			<EditProfileModal
				open={isEditProfileOpen}
				onOpenChange={setIsEditProfileOpen}
				profile={profile}
				onSave={handleSaveProfile}
			/>

			<FollowersFollowingModal
				open={followersFollowingModal.open}
				onOpenChange={(open) => {
					setFollowersFollowingModal({ ...followersFollowingModal, open });
				}}
				userId={profile.id}
				type={followersFollowingModal.type}
			/>
		</div>
	);
}
