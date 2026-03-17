import { zodResolver } from "@hookform/resolvers/zod";
import { type UpdateProfileInput, type UserProfile, updateProfileSchema } from "@repo/trpc/schemas";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// 프로필 편집 모달에 필요한 props 정의
// open/onOpenChange: 모달 열림 상태를 부모 컴포넌트에서 제어
// profile: 현재 사용자 프로필 데이터 (기본값 세팅에 사용)
// onSave: 수정된 프로필 데이터를 서버에 전송하는 콜백
interface EditProfileModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	profile: UserProfile;
	onSave: (updates: UpdateProfileInput) => Promise<void>;
}

export default function EditProfileModal({
	open,
	onOpenChange,
	profile,
	onSave,
}: EditProfileModalProps) {
	// React Hook Form에 Zod resolver를 연결하여 프론트/백엔드 동일한 스키마로 유효성 검증
	// updateProfileSchema: tRPC 공통 패키지에서 가져온 Zod 스키마 (name, bio, website)
	const form = useForm<UpdateProfileInput>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: profile.name,
			bio: profile.bio || "",
			website: profile.website || "",
		},
	});

	// 다른 유저 프로필로 전환될 경우 폼 상태를 새 프로필 값으로 리셋
	useEffect(() => {
		form.reset({
			name: profile.name,
			bio: profile.bio || "",
			website: profile.website || "",
		});
	}, [profile, form]);

	// 폼 제출 시 부모의 onSave 호출 후 모달 닫기
	const handleSubmit = (data: UpdateProfileInput) => {
		onSave(data);
		onOpenChange(false);
	};

	// watch로 bio 필드를 구독하여 글자 수를 실시간으로 표시
	const bio = form.watch("bio");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Your name" max={50} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="bio"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bio</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Tell people about yourself..."
											rows={4}
											maxLength={150}
											{...field}
										/>
									</FormControl>
									<FormDescription>{bio?.length || 0}/150 characters</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="website"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Website</FormLabel>
									<FormControl>
										<Input type="url" placeholder="https://example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end gap-2">
							<Button type="button" variant={"outline"} onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
