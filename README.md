# [Dependencimator 2000](https://dependencimator.herokuapp.com)
Dependency tree viewer.
Truth is, npm dependencies in your Node project will hardly ever look like this. 1) npm is flattening the structure, moving everything as close to the top as possible. 2) installed version are affected by whatever you already have in your project that could satisfy them, so each install is a bit different. Only way to enumerate what is really installed is by looking into the `package-lock.json`.

`https://dependencimator.herokuapp.com`

## Features
- slick design
- asynchronous loading for massive dependency trees (try `webpack@latest`)
- loop detection
- …

## Running locally

```bash
npm install
npm start
```

Should make app available on [`http://localhost:8080`](http://localhost:8080).

For `npm test`, cypress needs app already running. Have `npm start` running in a separate session/process and `http://localhost:8080` reachable.

## Caching
Planned this with edge caching (CDN) in mind. We can setup a single rule to aggressively cache all 200 responses - those are the resolved exact versions, that could only be invalidated by unpublishing (an event we could subscribe to on npm), thus we can opt-in for a fairly long TTL on these endpoints. Only weak chain is now dependency on npm's API, but we could have a fallback mirror setup.

It requires smarter clients that are able to glue the tree and follow links to children dependencies. On the bright side, we don't have to generate/store massive dependency trees, which would be hard to cache because of changing dependency ranges. Plus HTTP2 should handle those small requests.

## Deployment
Used parcel.js to make the app a single deployable with a single `npm start` command, including its frontend. It's possible to split the CSS/JS build step and use it somewhere else if needed.

## Missing
- proper error handling/messaging in the UI
- don't use npm registry for cypress testing, but have some mock running
- UI tweaks like links to the npm packages etc.
