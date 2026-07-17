# Upkick Templates

Official project templates used by the Upkick CLI.

Each template is stored independently under the `templates/` directory and published as a versioned GitHub Release asset.

## Repository structure

```text
.
├── .github/
│   └── workflows/
│       └── release-template.yml
├── schemas/
│   ├── templates-index.schema.json
│   └── upkick-template.schema.json
├── scripts/
│   ├── package-template.mjs
│   └── update-template-index.mjs
├── templates/
│   ├── base/
│   │   └── upkick.template.json
│   └── ai-sdk-chatbot/
│       └── upkick.template.json
├── templates.json
└── package.json
```

## Template metadata

Every template must contain an `upkick.template.json` file.

Example:

```json
{
  "$schema": "../../schemas/upkick-template.schema.json",
  "schemaVersion": 1,
  "id": "base",
  "name": "Upkick Base",
  "description": "Production-ready base template for Upkick projects.",
  "version": "0.1.0",
  "status": "stable",
  "default": true,
  "category": "monorepo",
  "tags": [
    "turborepo",
    "nextjs",
    "typescript",
    "pnpm"
  ],
  "requirements": {
    "node": ">=22.12.0",
    "packageManagers": [
      "pnpm"
    ]
  },
  "defaults": {
    "packageManager": "pnpm",
    "installDependencies": true,
    "initializeGit": true
  }
}
```

The template ID must match its directory name.

```text
templates/base/upkick.template.json
          └── id: "base"
```

Only one template may have:

```json
{
  "default": true
}
```

## Install dependencies

```bash
pnpm install
```

## Package a template locally

```bash
pnpm package base
```

Example output:

```text
dist/
└── base/
    └── 0.1.0/
        ├── base.tar.gz
        ├── base.sha256
        └── upkick.template.json
```

The archive contains the contents of the template directory directly.

```text
base.tar.gz
├── upkick.template.json
├── package.json
├── apps/
└── packages/
```

## Update the template index

```bash
pnpm index:update base
```

This command reads:

```text
templates/base/upkick.template.json
```

and updates the corresponding entry in:

```text
templates.json
```

The release workflow runs this automatically after a successful release.

## Release a template

Each template is versioned independently.

The release tag format is:

```text
<template-id>-v<version>
```

Examples:

```text
base-v0.1.0
base-v0.2.0
ai-sdk-chatbot-v1.0.0
```

Before creating a tag, update the template version:

```json
{
  "id": "base",
  "version": "0.2.0"
}
```

Commit and push the change:

```bash
git add templates/base/upkick.template.json
git commit -m "release(base): v0.2.0"
git push origin main
```

Create and push the matching tag:

```bash
git tag base-v0.2.0
git push origin base-v0.2.0
```

The GitHub Actions workflow will:

1. Parse the template ID and version from the tag.
2. Validate the template metadata.
3. Package the selected template.
4. Generate a SHA-256 checksum.
5. Create a GitHub Release.
6. Upload the archive, checksum and metadata.
7. Update `templates.json`.
8. Commit the updated index to `main`.

## Release assets

A release contains:

```text
base.tar.gz
base.sha256
upkick.template.json
```

Example download URL:

```text
https://github.com/upkickdev/templates/releases/download/base-v0.2.0/base.tar.gz
```

## Template index

The CLI discovers the latest version of each template through:

```text
templates.json
```

Example:

```json
{
  "schemaVersion": 1,
  "templates": {
    "base": {
      "name": "Upkick Base",
      "description": "Production-ready base template for Upkick projects.",
      "latest": "0.2.0",
      "status": "stable",
      "default": true,
      "category": "monorepo",
      "tags": [
        "turborepo",
        "nextjs",
        "typescript",
        "pnpm"
      ],
      "release": {
        "tag": "base-v0.2.0",
        "archive": "base.tar.gz",
        "checksum": "base.sha256",
        "metadata": "upkick.template.json"
      }
    }
  }
}
```

The Upkick CLI can retrieve this file from:

```text
https://raw.githubusercontent.com/upkickdev/templates/main/templates.json
```

It then downloads the selected template from its versioned GitHub Release.

## Adding a new template

Create the template directory:

```text
templates/my-template/
```

Add template files and metadata:

```text
templates/my-template/upkick.template.json
```

The metadata ID must match the directory:

```json
{
  "id": "my-template",
  "version": "0.1.0",
  "default": false
}
```

Package it locally:

```bash
pnpm package my-template
```

Release it:

```bash
git tag my-template-v0.1.0
git push origin my-template-v0.1.0
```
