import { ALL_VIDEO_SERVICES } from "../constants";

export type VideoService = (typeof ALL_VIDEO_SERVICES)[number];

export interface VideoId {
	service: VideoService;
	id: string;
}

export interface SourceObj {
	url: string;
	contentType: string;
	quality: number;
}

export interface CaptionObj {
	url: string;
	contentType: string;
	name: string;
	default?: false;
}

export interface VideoMetadata {
	title: string;
	description: string;
	length: number;
	thumbnail: string;
	mime: string;
	highlight?: true;
	hls_url?: string;
	dash_url?: string;
	sources?: SourceObj[];
	captions?: CaptionObj[];
}

export type Video = VideoId & Partial<VideoMetadata>;

export interface QueueItem extends Video {
	startAt?: number;
	endAt?: number;
}
