Quick usage

1. Start a bot with the `MessageContent` intent enabled (if you need message text).
2. Fetch the channel and call `createTranscript(channel, options)`.

Minimal example

```ts
import * as discord from "discord.js";
import { config } from "dotenv";
import { createTranscript } from "transcriptify";

config();

const client = new discord.Client({
  intents: [
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildMessages,
    discord.GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {
  const ch = await client.channels.fetch("CHANNEL_ID");
  if (!ch || !ch.isTextBased()) throw new Error("Channel not found or not text-based");

  const out = await createTranscript(ch, { filename: "transcript.html" });
  console.log("Saved:", out?.name ?? out);
  await client.destroy();
});

client.login(process.env.TOKEN as string);
```


Options (full)

The following options are accepted by `createTranscript(channel, options)` (types and defaults shown):

- `limit?: number` — Maximum number of messages to include. Default: include all messages.
- `saveAssets?: boolean | { compression?: number; dir?: string }` — Download attachments and save into an assets directory. If an object, `compression` is optional (1-100, external processing required) and `dir` sets the output folder (default `"assets"`). Default: `false`.
- `filename?: string` — Output filename. Default: `transcript-{channelID}-{timestamp}.html`.
- `poweredBy?: boolean` — Show "Powered by dcTranscriptify" footer. Default: `true`.
- `allowThemeSwitching?: boolean` — Allow the reader to switch transcript theme. Default: `true`.
-- `theme?: TranscriptThemes` — Default theme. Default: system preference (dark/light).
- `ignore?: { bots?: boolean; userIDs?: string[]; attachments?: { images?: boolean; videos?: boolean; audio?: boolean; files?: boolean }; guildBadges?: boolean }` — Controls what to exclude:
  - `ignore.bots` — ignore bot accounts. Default: `false`.
  - `ignore.userIDs` — array of user IDs to exclude.
  - `ignore.attachments.images|videos|audio|files` — selectively ignore attachment classes. Default: `false` for each.
  - `ignore.guildBadges` — ignore guild badges. Default: `false`.

Available themes

The `theme` option accepts the following names:

- `light`, `ash`, `dark`, `onyx`, `system`, `mint_apple`, `citrus_sherbert`, `retro_raincloud`, `hanami`, `sunrise`, `cotton_candy`, `lofi_vibes`, `desert_khaki`, `sunset`, `chroma_glow`, `forest`, `crimson`, `midnight_blurple`, `mars`, `dusk`, `under_the_sea`, `retro_storm`, `neon_nights`, `strawberry_lemonade`, `aurora`, `sepia`.

Defaults summary

- `limit`: include all messages (no limit).
- `saveAssets`: `false` (set to `true` or object to download attachments).
- `filename`: `transcript-{channelID}-{timestamp}.html`.
- `poweredBy`: `true`.
- `allowThemeSwitching`: `true`.
- `ignore.*`: all `false` / empty by default.

Tips

- Use `createTranscriptRaw(...)` to get raw `Message[]` instead of HTML if you want to transform or preview locally.
- For production use, import from the published package name `transcriptify`.
