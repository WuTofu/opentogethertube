import { ref } from "vue";

export interface PlayerNotif {
	type: "error" | "warning" | "info";
	message: string;
	details?: string;
}

export function usePlayerNotif() {
	const playerNotifs = ref<PlayerNotif[]>([
		{
			type: "error",
			message: "Failed to load video",
			details:
				"The video could not be loaded. This may be due to network issues, an invalid video URL, or the video being unavailable in your region.",
		},
		{
			type: "error",
			message: "Playback error occurred",
			details:
				"An error occurred during video playback. Error code: MEDIA_ERR_DECODE. The video format may not be supported by your browser.",
		},
		{
			type: "error",
			message: "Network connection lost",
			details:
				"The connection to the video server was lost. Please check your internet connection and try again.",
		},
		{
			type: "error",
			message: "Video format not supported",
		},
		{
			type: "warning",
			message: "Slow network connection detected",
		},
		{
			type: "info",
			message: "Video playback will resume shortly",
			details:
				"The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.The connection to the video server was lost. Please check your internet connection and try again.",
		},
	]);

	function addNotification(notif: PlayerNotif) {
		playerNotifs.value.push(notif);
	}

	function removeNotification(index: number) {
		playerNotifs.value.splice(index, 1);
	}

	function clearNotifications() {
		playerNotifs.value = [];
	}

	return {
		playerNotifs,
		addNotification,
		removeNotification,
		clearNotifications,
	};
}
