import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type UseFormSetError, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormRootError,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type LoginFormData, loginSchema } from "../lib/schema";

interface LoginFormProps {
	// setError를 함께 전달하여 부모 컴포넌트에서 root 레벨 폼 에러를 설정할 수 있게 함
	onSubmit: (data: LoginFormData, setError: UseFormSetError<LoginFormData>) => Promise<void>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (data: LoginFormData) => {
		setIsSubmitting(true);

		try {
			// form.setError를 전달하여 onSubmit에서 글로벌 폼 에러를 설정할 수 있게 함
			await onSubmit(data, form.setError);
		} catch (err) {
			console.error("Login error:", err);
		}
		setIsSubmitting(false);
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
				<CardDescription>Enter your credentials to access your account</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						{/* 필드 에러가 아닌 글로벌 폼 에러 (예: 잘못된 인증 정보) 표시 */}
						<FormRootError />
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="Enter your email"
											disabled={isSubmitting}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Create a password"
											disabled={isSubmitting}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? "Sign in..." : "Sign in"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
