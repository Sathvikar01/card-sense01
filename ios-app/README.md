# CardSense for iOS

The CardSense app for iPhone, built with Expo. Same four colours, type and card art as the website.

- **Home:** pick your biggest spend and the card that pays you most comes to the front.
- **Cards:** the full catalogue from Supabase, with search and a page per card.
- **Account:** sign in with your CardSense email and password.

"Find my card" opens the website's advisor in an in-app Safari sheet.

## Try it on your iPhone (no Mac needed)

1. Install **Expo Go** from the App Store.
2. On a computer with Node 20+:

   ```bash
   cd ios-app
   npm install
   cp .env.example .env.local   # fill in the three values
   npx expo start --tunnel
   ```

3. Scan the QR code with the iPhone camera. The app opens in Expo Go.

`.env.local` takes the same public values the website uses: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_WEB_URL` (your Vercel production URL).

## Put it on the App Store

Needs an Apple Developer account and a free Expo account. EAS builds in the cloud, so no Mac is needed.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios
```

Set the three `EXPO_PUBLIC_*` values as EAS environment variables first (`npx eas-cli@latest env:create`).

## Develop

```bash
npm run typecheck
npm run lint
npx expo export --platform ios   # bundles the app; fails on a broken import
```

Shared with the website, not copied: the estimator's rates (`../src/components/landing/hero-cards.ts`) and the card art designs (`../src/data/card-designs.ts`). `metro.config.js` watches only those two folders.
