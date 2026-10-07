# Botaí: build instructions for add-on reviewers

Botaí is a browser extension built with WXT 0.21.4 and Vite 8 from TypeScript sources in a pnpm workspace (https://github.com/PiluVitu/Botai). This archive contains only the parts of the repository that the extension needs:

- `extensao`: the extension itself;
- `packages/core`: the workspace package with the test data generators and the form field classifier, which the extension imports as TypeScript source (it has no prebuilt output here);
- at the root, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc` and `scripts/check-tailwind-source.mjs`. They are here only to reproduce the build: the workspace layout, the lockfile, the install settings and a CSS check that the build scripts run;
- `vendor/piluvitu-ui-0.1.0.tgz`: the npm package of `@piluvitu/ui`, which `pnpm-workspace.yaml` > `overrides` installs from this file until it is fetched from the npm registry.

The popup's UI components come from `@piluvitu/ui`, our design system, installed at the version locked in `pnpm-lock.yaml` (MIT; source at https://github.com/PiluVitu/PiluVitu-Dev/tree/main/packages/ui).

## Environment

- Ubuntu 24.04
- Node.js 24.14.0
- pnpm 11.1.1, pinned in `package.json` > `packageManager`. `corepack enable` installs it.

Every pull request that touches the extension rebuilds the Firefox package from this archive on Ubuntu 24.04 with Node.js 24.14.0 and compares it byte by byte with the package built from the repository (`extensao/scripts/reproduzir-fontes.sh`).

## Build

From the root of this archive:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @pilutech/botai exec wxt zip -b firefox
```

Output:

- unpacked: `extensao/.output/firefox-mv3/`
- package: `extensao/.output/botai-<version>-firefox.zip`

Both are identical to the submitted package.

While installing, the root `prepare` script (husky, the Git hooks of the repository) prints `.git can't be found` and exits successfully. While zipping, WXT 0.21.4 prints `WARN Could not get stats of '<file>'` once for each file of the sources archive. It resolves those paths against `extensao` instead of the archive root only to print their sizes; the archives are not affected.

The Opera package is built the same way with `-b opera` instead of `-b firefox` (`extensao/.output/opera-mv3/`). Its own code is not minified.

## Third-party code

The bundles include, from npm and at the versions locked in `pnpm-lock.yaml`: React and React DOM; Font Awesome; the WXT runtime helpers (`@wxt-dev/browser`, `@wxt-dev/storage`, `@webext-core/isolated-element`); `@piluvitu/ui` and, through it, `@radix-ui/react-avatar`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx` and `tailwind-merge`; and the Plus Jakarta Sans and JetBrains Mono fonts from Fontsource. The `web-ext lint` warnings (`UNSAFE_VAR_ASSIGNMENT`) all come from `react-dom` and `@fortawesome/fontawesome-svg-core` in the popup chunk.

## What the extension does

Botaí generates a fake Brazilian test identity (CPF, CNPJ, CEP, name, e-mail) and fills the form in the active tab when the user clicks the fill button in the toolbar popup, presses the keyboard shortcut or picks an item in the context menu (`activeTab` + `scripting`). The generated identity is stored only in `storage.local`. The extension makes no network requests and loads no remote code. The only way the generated data leaves the browser is "Abrir caixa de entrada" (Open inbox), which the user picks to open, in a new tab, the public disposable mailbox of the generated e-mail address (`https://tuamaeaquelaursa.com/<user>`).

The `menus` permission (Firefox only) is used for `menus.getTargetElement`, so that "Inserir" (Insert) writes into the field that was right-clicked.
