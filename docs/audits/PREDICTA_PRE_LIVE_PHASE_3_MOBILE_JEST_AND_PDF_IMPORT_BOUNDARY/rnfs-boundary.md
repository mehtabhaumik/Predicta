# Phase 3 RNFS Boundary

Phase: `PREDICTA_PRE_LIVE_PHASE_3_MOBILE_JEST_AND_PDF_IMPORT_BOUNDARY`

## Problem

Mobile Jest imported `apps/mobile/src/services/pdf/pdfGenerator.ts`, which
imports `react-native-fs`. Jest then tried to parse
`react-native-fs/FS.common.js`, which contains Flow syntax such as:

```text
var normalizeFilePath = (path: string) => ...
```

That caused `App.test.tsx` to fail before the app could render.

## Fix

The production mobile PDF path still imports `react-native-fs`.

Only Jest is redirected through:

```text
^react-native-fs$ -> <rootDir>/__mocks__/reactNativeFs.js
```

The mock exposes:

- `DocumentDirectoryPath`
- `writeFile()`

This keeps the native file-system boundary testable without letting Jest parse
React Native FS internals.

## Production Safety

`corepack pnpm --filter @pridicta/mobile bundle:android` passed after the
change, proving Metro still bundles the production app path.

## Focused Coverage

`apps/mobile/__tests__/pdfGenerator.test.ts` now verifies:

- shared report payload construction
- backend PDF bytes are fetched
- PDF bytes are base64 encoded
- the native FS boundary receives `writeFile(filePath, base64, 'base64')`
- backend PDF errors do not write a file

