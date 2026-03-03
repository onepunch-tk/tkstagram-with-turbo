// next-themes를 래핑한 테마 프로바이더 (ShadCN 공식 문서 권장 방식)
// attribute="class"로 CSS 클래스 기반 다크모드 전환
import { ThemeProvider as NextThemeProvider } from "next-themes";

export default function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemeProvider>) {
	return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
