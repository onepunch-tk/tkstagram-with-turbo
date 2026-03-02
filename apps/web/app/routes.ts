import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("signup", "routes/auth/pages/signup.tsx"),
	route("login", "routes/auth/pages/login.tsx"),
] satisfies RouteConfig;
