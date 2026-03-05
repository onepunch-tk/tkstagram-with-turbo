export const getImageUrl = (image: string | null) => {
	if (!image) {
		return "";
	}

	return `${import.meta.env.VITE_API_URL}/uploads/images/${image}`;
};
