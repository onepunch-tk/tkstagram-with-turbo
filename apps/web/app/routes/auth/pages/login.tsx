import type { UseFormSetError } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import LoginForm from "../components/login-form";
import { authClient } from "../lib/auth-client";
import type { LoginFormData } from "../lib/schema";

export default function Login() {
	const navigate = useNavigate();

	// setError: react-hook-form의 폼 에러 설정 함수 (root 레벨 에러 표시에 사용)
	const handleLogin = async (data: LoginFormData, setError: UseFormSetError<LoginFormData>) => {
		const { error } = await authClient.signIn.email({
			email: data.email,
			password: data.password,
		});

		// 로그인 실패 시 root 에러를 설정하여 FormRootError에 글로벌 에러 메시지 표시
		if (error) {
			setError("root", {
				message: "Invalid email or password. Please try again",
			});
			return;
		}

		// 로그인 성공 시 홈페이지로 리다이렉트
		navigate("/");
	};
	return (
		<div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-extrabold text-foreground">Sign in to your account</h2>
					<p className="mt-2 text-sm text-muted-foreground font-extrabold">
						Don't have an account?{" "}
						<Link to="/signup" className="font-medium text-primary hover:text-primary/90">
							Create one here
						</Link>
					</p>
				</div>
				<LoginForm onSubmit={handleLogin} />
			</div>
		</div>
	);
}
