import React from "react";
import { buildStickerCdnUrl } from "../helpers/cdnHelpers";

export default function StickerPreview({ st, size = 160, className = "", alt }: { st: any; size?: number; className?: string; alt?: string }) {
	const id = String(st?.id || st?.sticker_id || st?.assetId || "") || "";
	const initial = st?.url || (id ? buildStickerCdnUrl(id, size) : undefined);
	const [url, setUrl] = React.useState<string | undefined>(initial);
	React.useEffect(() => {
		let cancelled = false;
		async function loadMapping() {
			const win = window as any;
			if (win.__stickerMap) {
				const mapped = win.__stickerMap[id];
				if (mapped && mapped !== url && !cancelled) setUrl(mapped);
				return;
			}
			const DEFAULT_STICKER_MAP: Record<string, string> = {
				"751606379340365864": "/system/wave.gif"
			};
			win.__stickerMap = win.__stickerMap || DEFAULT_STICKER_MAP;
			const mapped = win.__stickerMap[id];
			if (mapped && mapped !== url && !cancelled) setUrl(mapped);
		}
		loadMapping();
		return () => {
			cancelled = true;
		};
	}, [id]);

	if (!url) return null;

	return <img src={url} alt={alt || st?.name || "sticker"} className={className} />;
}
