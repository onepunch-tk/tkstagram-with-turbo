import { Home } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function ProfileNavigation() {
	return (
		<div className="border-b sticky top-0 bg-background z-10">
			<div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/">
						<Home className="h-6 w-6" />
					</Link>
				</Button>
			</div>
		</div>
	);
}
