<template>
	<div class="direct">
		<video id="directplayer" preload="auto" crossorigin="anonymous"></video>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, onBeforeUnmount, toRefs } from "vue";
import Plyr from "plyr";
import "plyr/src/sass/plyr.scss";
import type {
	MediaPlayerWithCaptions,
	MediaPlayerWithPlaybackRate,
	MediaPlayerWithQuality,
} from "../composables";
import { useCaptions, useQualities } from "../composables";
import type { CaptionTrack, VideoTrack } from "@/models/media-tracks";
import { SourceObj, CaptionObj } from "ott-common/models/video";

export default defineComponent({
	name: "PlyrPlayer",
	props: {
		service: { type: String, required: true },
		videoUrl: { type: String, required: true },
		videoMime: { type: String, required: true },
		thumbnail: { type: String },
		sources: { type: Array<SourceObj> },
		captionsTracks: { type: Array<CaptionObj> },
	},
	emits: [
		"apiready",
		"ready",
		"playing",
		"paused",
		"waiting",
		"buffering",
		"error",
		"end",
		"buffer-progress",
		"buffer-spans",
	],
	setup(props, { emit }) {
		const { videoUrl, videoMime, thumbnail, sources, captionsTracks } = toRefs(props);
		const videoElem = ref<HTMLVideoElement | undefined>();
		const player = ref<Plyr | undefined>();

		const playerImpl: MediaPlayerWithCaptions &
			MediaPlayerWithPlaybackRate &
			MediaPlayerWithQuality = {
			play() {
				if (!player.value) {
					console.error("player not ready");
					return;
				}
				return player.value.play();
			},
			pause() {
				if (!player.value) {
					console.error("player not ready");
					return;
				}
				return player.value.pause();
			},
			setVolume(volume: number) {
				if (!player.value) {
					console.error("player not ready");
					return;
				}
				player.value.volume = volume / 100;
			},
			getPosition() {
				if (!player.value) {
					console.error("player not ready");
					return 0;
				}
				return player.value.currentTime;
			},
			setPosition(position: number) {
				if (!player.value) {
					console.error("player not ready");
					return;
				}
				player.value.currentTime = position;
			},

			isCaptionsSupported(): boolean {
				return ["direct"].includes(props.service);
			},
			setCaptionsEnabled(enabled: boolean): void {
				player.value?.toggleCaptions(enabled);
			},
			isCaptionsEnabled(): boolean {
				return player.value?.currentTrack !== -1;
			},
			getCaptionsTracks(): CaptionTrack[] {
				const tracks: CaptionTrack[] = [];
				for (let i = 0; i < (videoElem.value?.textTracks?.length ?? 0); i++) {
					const track = videoElem.value?.textTracks[i];
					if (!track || !["subtitles", "captions"].includes(track.kind)) {
						continue;
					}
					tracks.push({
						kind:
							track.kind === "subtitles" || track.kind === "captions"
								? track.kind
								: undefined,
						label: track.label || undefined,
						srclang: track.language || undefined,
						default: false, // `TextTrack` type does not provide `default` property
					});
				}
				return tracks;
			},
			setCaptionsTrack(track: number): void {
				if (!player.value) {
					console.error("player not ready");
					return;
				}
				console.log("PlyrPlayer: setCaptionsTrack:", track);
				player.value.currentTrack = track;
			},

			isQualitySupported(): boolean {
				return (sources?.value?.length ?? 1) > 1;
			},
			getVideoTracks(): VideoTrack[] {
				return (
					sources.value?.map(source => ({
						label: source.quality.toString(),
						width: undefined,
						height: undefined,
					})) ?? []
				);
			},
			setVideoTrack(idx: number): void {
				if (!player.value) {
					console.error("player not ready");
					return;
				}
				console.log("PlyrPlayer: setVideoTrack:", idx);
				if (idx < 0 || idx >= (sources?.value?.length ?? 1)) {
					console.error("Invalid video track index:", idx);
					return;
				}
				if (!sources.value?.[idx]) {
					console.error("Invalid video track quality:", idx);
					return;
				}
				player.value.quality = sources.value[idx].quality;
			},
			isAutoQualitySupported(): boolean {
				return false;
			},
			getCurrentActiveQuality(): number | null {
				if (!player.value || !videoElem.value) {
					console.error("player not ready");
					return null;
				}
				// Somehow plyr returns null for player.value.quality
				// So we have to implement this ourself
				const currentSrc = decodeURI(videoElem.value.src);
				if (!currentSrc) {
					console.warn("video source not available yet:", currentSrc);
					return null;
				}
				const currentQualityIdx = sources.value?.findIndex(
					source => source.url === currentSrc
				);
				if (currentQualityIdx === -1) {
					console.warn("current video source not found in sources list:");
					return null;
				}
				return currentQualityIdx ?? null;
			},

			getAvailablePlaybackRates(): number[] {
				return [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
			},
			getPlaybackRate(): number {
				if (!player.value) {
					console.error("player not ready");
					return 1;
				}
				return player.value.speed;
			},
			async setPlaybackRate(rate: number): Promise<void> {
				if (!player.value) {
					console.error("player not ready");
					return;
				}
				player.value.speed = rate;
			},
		};

		const captions = useCaptions();
		const qualities = useQualities();
		onMounted(() => {
			videoElem.value = document.getElementById("directplayer") as HTMLVideoElement;
			player.value = new Plyr(videoElem.value, {
				controls: [
					"settings", // Settings menu, and to enable quality control
				],
				settings: [
					"quality", // Only show quality in Settings menu, and to enable quality control
				],
				clickToPlay: false,
				keyboard: {
					focused: false,
					global: false,
				},
				disableContextMenu: false,
				fullscreen: {
					enabled: false,
				},
				captions: {
					active: true,
					language: "auto",
					update: false,
				},
			});

			player.value.on("ready", () => {
				emit("ready");
				captions.captionsTracks.value = playerImpl.getCaptionsTracks();
				qualities.videoTracks.value = playerImpl.getVideoTracks();
				qualities.currentVideoTrack.value = playerImpl.getCurrentActiveQuality() ?? 0;
			});
			player.value.on("ended", () => emit("end"));
			player.value.on("playing", () => emit("playing"));
			player.value.on("pause", () => emit("paused"));
			player.value.on("play", () => emit("waiting"));
			player.value.on("stalled", () => emit("buffering"));
			player.value.on("loadstart", () => emit("buffering"));
			player.value.on("canplay", () => emit("ready"));
			player.value.on("progress", () => {
				if (!player.value) {
					return;
				}
				emit("buffer-progress", player.value.buffered);
			});
			player.value.on("qualitychange", () => {
				qualities.currentActiveQuality.value = playerImpl.getCurrentActiveQuality() ?? 0;
			});
			player.value.on("captionsenabled", () => {
				captions.isCaptionsEnabled.value = true;
				captions.currentTrack.value = player.value?.currentTrack ?? 0;
			});
			player.value.on("error", err => {
				emit("error");
				console.error("PlyrPlayer: error:", err);
			});

			loadVideoSource();
		});
		onBeforeUnmount(() => {
			player.value?.destroy();
		});

		function loadVideoSource() {
			console.log("PlyrPlayer: loading video source:", videoUrl.value, videoMime.value);
			if (!player.value) {
				console.error("player not ready");
				return;
			}

			const sourcesList: Plyr.Source[] = [];
			const captionList: Plyr.Track[] = [];
			let captionTrackIdx = -1;
			if (videoMime.value !== "application/json") {
				sourcesList.push({
					src: videoUrl.value,
					type: videoMime.value,
				});
			} else {
				for (let i = 0; i < (sources?.value?.length ?? 0); i++) {
					const source = sources.value?.[i] ?? { url: "", contentType: "", quality: -1 };
					sourcesList.push({
						src: source.url,
						type: source.contentType,
						size: source.quality,
					});
				}
				for (let i = 0; i < (captionsTracks?.value?.length ?? 0); i++) {
					const caption = captionsTracks.value?.[i] ?? {
						name: "",
						url: "",
						default: false,
					};
					captionList.push({
						kind: "captions",
						label: caption.name,
						srcLang: caption.name,
						src: caption.url,
						default: caption.default,
					});
					if (captionTrackIdx === -1 && (caption.default ?? false)) {
						// Plyr's captions lang setting (auto) ignores default setting
						// let's set it manually
						captionTrackIdx = i;
						console.log(`Found default caption track: ${captionTrackIdx}`);
					}
				}
			}
			player.value.source = {
				sources: sourcesList,
				type: "video",
				poster: thumbnail.value,
				tracks: captionList,
			};

			// const captionTrackUser = window.localStorage.getItem("ott-caption-user-lang");
			// if user prefers what the land of caption is
			// if (captionTrackUser !== null) {
			// 	console.log(`Found the user prefers caption lang: ${captionTrackUser}`);
			// 	const captionTrackIdxUser = findTrackIdx(captionTrackUser);
			// 	if (captionTrackIdxUser !== -1) {
			// 		captionTrackIdx = captionTrackIdxUser;
			// 		console.log(
			// 			`Found caption lang '${captionTrackUser}' at track '${captionTrackIdxUser}'`
			// 		);
			// 	}
			// }

			// Set caption track by user preference (first) or source's default
			if (captionTrackIdx !== -1) {
				setTimeout(() => {
					if (player.value) {
						player.value.currentTrack = captionTrackIdx;
					}
				}, 0);
			}

			videoElem.value = document.querySelector("video") as HTMLVideoElement;

			// this is needed to get the player to keep playing after the previous video has ended
			player.value.play();

			if (videoElem.value) {
				videoElem.value.addEventListener("progress", () => {
					if (player.value) {
						emit("buffer-progress", player.value.buffered);
					}
					if (videoElem.value) {
						emit("buffer-spans", videoElem.value.buffered);
					}
				});
				videoElem.value.addEventListener("loadstart", () => {
					console.debug("PlyrPlayer: video loadstart");
					emit("buffering");
				});
				videoElem.value.addEventListener("waiting", () => {
					console.debug("PlyrPlayer: video waiting");
				});
				videoElem.value.addEventListener("stalled", () => {
					console.debug("PlyrPlayer: video stalled");
					emit("buffering");
				});
				videoElem.value.addEventListener("canplay", () => {
					console.debug("PlyrPlayer: video canplay");
				});
			} else {
				console.error("video element not present");
			}

			emit("apiready");
		}

		watch(videoUrl, () => {
			console.log("PlyrPlayer: videoUrl changed");
			if (!player.value) {
				console.error("player not ready");
				return;
			}
			loadVideoSource();
		});

		return {
			player,
			...playerImpl,
		};
	},
});
</script>

<style lang="scss">
.direct,
.plyr {
	display: flex;
	align-items: center;
	justify-content: center;
	max-width: 100%;
	max-height: 100%;
	width: 100%;
	height: 100%;
}

.plyr__video-wrapper {
	max-width: 100%;
	max-height: 100%;
	width: 100%;
	height: 100%;
}

.direct video {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: contain;
	object-position: 50% 50%;
}

.plyr__captions {
	font-size: clamp(1em, 3cqh, 3em);
	bottom: 50px;
}

.plyr__menu {
	// Hide plyr setting menu
	// (To be able to switch qulality, the menu must be enabled)
	display: none;
	// Show plyr setting menu on the lower right of player
	// 	position: absolute;
	// 	bottom: 85px;
	// 	right: 45px;
}
</style>
