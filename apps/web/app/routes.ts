import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("signup", "routes/auth/signup.tsx"),
	route("login", "routes/auth/login.tsx"),
] satisfies RouteConfig;
