# JARVIS TV — YOUR WORLD. YOUR ENTERTAINMENT.

JARVIS TV is a Next.js App Router + TypeScript live-channel catalog with HLS.js playback. Use only playlist URLs and streams you are authorized to access.

## Requirements

- Node.js 20 or newer recommended
- npm

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:5173>. Restart the dev server after changing environment variables.

## Configure a playlist

### Public M3U URL

Set `NEXT_PUBLIC_PLAYLIST_URL` in `.env.local` when the playlist is public and does not need a secret. For example:

```dotenv
NEXT_PUBLIC_PLAYLIST_URL=https://example.com/public-playlist.m3u
```

Replace the example with your actual authorized M3U URL. If unset, the app uses the default Indonesia playlist configured in `config/site.ts`.

### Private playlist API using a Bearer token

For an API endpoint that expects `Authorization: Bearer <token>`, use server-only variables in `.env.local`:

```dotenv
PLAYLIST_URL=https://api.example.com/playlist.m3u
PLAYLIST_TOKEN=replace-with-your-own-token
```

`PLAYLIST_URL` takes precedence over `NEXT_PUBLIC_PLAYLIST_URL`. The token is read by `app/api/playlist/route.ts` on the server and is not intentionally returned to the browser. When a token is configured, the API response uses `private, no-store` caching. Do not use the `NEXT_PUBLIC_` prefix for secrets, and never commit `.env.local`.

This implementation assumes the provider accepts a Bearer token and returns M3U text containing `#EXTINF`. If the provider uses a different header, query parameter, JSON response, cookie, or a separate stream-token exchange, the API integration must be adapted to its official documentation.

**Important:** playlist authentication only authenticates the playlist request. It does not automatically attach the token to each HLS manifest, segment, or stream URL in the browser player. The provider must support playback in the browser and permit the required CORS access, or an authorized playback integration is needed. Do not attempt to bypass access controls.

## Commands

```bash
npm run typecheck
npm run lint
npm run build
```

## GitHub safety

- Commit `.env.example`, not `.env.local`.
- `.gitignore` excludes `.env*` files except the safe example templates.
- If a token was exposed, revoke or rotate it at the provider. Removing it from a file does not invalidate it.

## Project areas

- `app/api/playlist/route.ts` — same-origin playlist proxy and optional Bearer authentication
- `config/site.ts` — site identity and default public playlist URL
- `services/channelService.ts` — fetches/parses the playlist into channel data
- `components/player/VideoPlayer.tsx` — HLS.js/native HLS playback
- `data/playlist-id.m3u` — local snapshot fallback when the configured playlist cannot be fetched
