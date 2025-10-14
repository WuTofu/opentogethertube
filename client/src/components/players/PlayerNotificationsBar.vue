<template>
	<div class="player-notifications">
		<v-sheet
			v-for="(value, idx) in playerNotifs"
			:key="`${value.message}-${idx}`"
			:color="value.type"
			density="compact"
		>
			<v-container fluid style="padding: 6px">
				<div style="display: flex; align-items: center">
					<v-icon
						:icon="
							value.type === 'error'
								? mdiAlertBox
								: value.type === 'warning'
								? mdiAlertCircle
								: mdiInformationBox
						"
					/>
					<span>{{ value.message }}</span>
					<v-spacer />
					<v-btn v-if="value.details" size="x-medium" variant="text">
						{{ $t("player.notif-details") }}
						<v-dialog max-width="600px" activator="parent" scrollable>
							<template v-slot:default="{ isActive }">
								<v-card>
									<v-card-title>
										<span>{{ $t("player.notif-details") }}</span>
									</v-card-title>
									<v-card-text>
										<pre style="white-space: pre-wrap; word-wrap: break-word">{{
											value.details
										}}</pre>
									</v-card-text>
									<v-card-actions>
										<v-spacer />
										<v-btn
											:color="
												copyStatus === CopyStatus.SUCCESS
													? 'success'
													: copyStatus === CopyStatus.FAILED
													? 'error'
													: 'primary'
											"
											@click="copyDetails(value.details)"
										>
											{{
												copyStatus === CopyStatus.SUCCESS
													? $t("common.copied")
													: copyStatus === CopyStatus.FAILED
													? $t("common.failed")
													: $t("common.copy")
											}}
										</v-btn>
										<v-btn @click="isActive.value = false">
											{{ $t("common.close") }}
										</v-btn>
									</v-card-actions>
								</v-card>
							</template>
						</v-dialog>
					</v-btn>
					<v-btn size="x-small" variant="text" icon @click="removeNotification(idx)">
						<v-icon :icon="mdiClose" />
					</v-btn>
				</div>
			</v-container>
		</v-sheet>
	</div>
</template>

<script lang="ts" setup>
import { mdiClose, mdiAlertBox, mdiAlertCircle, mdiInformationBox } from "@mdi/js";
import { ref } from "vue";
import { usePlayerNotif } from "../composables";

const { playerNotifs, removeNotification } = usePlayerNotif();

enum CopyStatus {
	IDLE = 0,
	SUCCESS = 1,
	FAILED = 2,
}
const copyStatus = ref<CopyStatus>(CopyStatus.IDLE);
let copyTimerId: ReturnType<typeof setTimeout> | null = null;

function resetTimer(): ReturnType<typeof setTimeout> {
	return setTimeout(() => {
		copyStatus.value = CopyStatus.IDLE;
	}, 3000);
}

async function copyDetails(details: string): Promise<void> {
	if (copyTimerId) {
		clearTimeout(copyTimerId);
	}
	if (navigator.clipboard) {
		try {
			await navigator.clipboard.writeText(details);
			copyStatus.value = CopyStatus.SUCCESS;
			copyTimerId = resetTimer();
		} catch (err) {
			console.error("Failed to copy details", err);
			copyStatus.value = CopyStatus.FAILED;
			copyTimerId = resetTimer();
		}
	} else {
		console.error("Clipboard API not available");
		copyStatus.value = CopyStatus.FAILED;
		copyTimerId = resetTimer();
	}
}
</script>

<style lang="scss" scoped>
.player-notifications {
	display: block;
	width: 100%;
}
</style>
