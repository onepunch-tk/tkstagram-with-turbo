import { Link, useNavigate } from "react-router";
import SignupForm from "../components/signup-form";
import { authClient } from "../lib/auth-client";
import type { SignupFormData } from "../lib/schema";

export default function Signup() {
	// useNavigate: React Router v7의 클라이언트 사이드 네비게이션 훅
	const navigate = useNavigate();

	const handleSignup = async (data: SignupFormData) => {
		// 1. 회원가입 요청
		await authClient.signUp.email({
			name: data.name,
			email: data.email,
			password: data.password,
		});

		// 2. 가입 후 자동 로그인 (JWT 쿠키 설정)
		await authClient.signIn.email({
			email: data.email,
			password: data.password,
		});

		// 3. 홈페이지로 리다이렉트
		navigate("/");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-extrabold text-foreground">Create your account</h2>
					<p className="mt-2 text-sm text-muted-foreground font-extrabold">
						Already have an account?{" "}
						<Link to="/login" className="font-medium text-primary hover:text-primary/90">
							Sign in here
						</Link>
					</p>
				</div>
				<SignupForm onSubmit={handleSignup} />
			</div>
		</div>
	);
}
