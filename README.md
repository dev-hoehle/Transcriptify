# `Transcriptify`

[![npm](https://img.shields.io/npm/dw/Transcriptify)](http://npmjs.org/package/Transcriptify)
![GitHub package.json version](https://img.shields.io/github/package-json/v/dev-hoehle/transcriptify)
![GitHub Repo stars](https://img.shields.io/github/stars/dev-hoehle/transcriptify?style=social)


> Generate beautiful, secure HTML transcripts from Discord channels.

- **Parses Discord formatting**: preserves markdown (bold, italics, code, strikethrough), mentions, and embeds.
- **Attachment-friendly**: renders images, videos, audio and files with optional asset saving.
- **Safe by default**: built‑in XSS protection and sanitization.
- **Themeable output**: client-side themes and optional theme switching.
- **Simple API**: `import { createTranscript } from 'transcriptify'` — call `createTranscript(channel, options)`.
- **discord.js support**: works with v14 and v15.

## Quickstart

Install (for local/dev usage):

```bash
npm i transcriptify
```

Create a `.env` with your bot token:

```
TOKEN=your_bot_token_here
```

Example ussage:
```ts
import * as discord from "discord.js";
import { config } from "dotenv";
import { createTranscript } from "transcriptify";

config();

const { Guilds, GuildMessages, MessageContent } = discord.GatewayIntentBits;

const client = new discord.Client({ intents: [Guilds, GuildMessages, MessageContent] });

client.on("ready", async () => {
    console.log("Logged in as", client.user?.tag);

    const channel = await client.channels.fetch("1469427183960199470");
    if (!channel || !channel.isTextBased()) {
        console.error("Invalid channel provided.");
        process.exit(1);
    }

    console.time("transcript");
    const attachment = await createTranscript(channel, {
        filename: "test-transcript.html",
    });

    console.timeEnd("transcript");

    console.log("✓ Generated:", attachment?.name ?? attachment);
    await client.destroy();
    process.exit(0);
});

client.login(process.env.TOKEN as string);
```

See the docs for a short usage guide and options: [docs/usage.md](https://github.com/dev-hoehle/transcriptify/docs/usage.md).

Preview:

![preview](https://raw.githubusercontent.com/dev-hoehle/transcriptify/docs/assets/preview.gif)

## Credits

- Inspired by: [ItzDerock/discord-html-transcripts](https://github.com/ItzDerock/discord-html-transcripts)
- Design / UI suggestions: GitHub Copilot

License: MIT — see [LICENSE](LICENSE)
