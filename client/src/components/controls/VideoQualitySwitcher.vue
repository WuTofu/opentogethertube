<template>
	<v-btn
		variant="text"
		icon
		:disabled="!supported"
		class="media-control"
		aria-label="Video Quality"
	>
		<v-icon>mdi-settings</v-icon>
		<v-menu location="top" offset-y activator="parent" :disabled="!supported">
			<v-list>
				<v-list-item
					link
					@click="setVideosTrack(idx)"
					v-for="(quality, idx) in qualities.videoTracks.value"
					:key="idx"
				>
					{{ quality }}
				</v-list-item>
			</v-list>
		</v-menu>
	</v-btn>
</template>

<script lang="ts" setup>
import { useQualities } from "../composables";

const qualities = useQualities();

function setVideosTrack(idx: number) {
	qualities.currentVideoTrack.value = idx;
}

const supported = qualities.isQualitySupported;
</script>

<style lang="scss">
@use "./media-controls.scss";
</style>
