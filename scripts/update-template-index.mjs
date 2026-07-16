import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(currentFile);
const repositoryRoot = path.resolve(scriptsDirectory, '..');

const templateId = process.argv[2];

if (!templateId) {
  throw new Error(
    'Template ID is required. Example: node scripts/update-template-index.mjs base',
  );
}

if (!/^[a-z0-9-]+$/.test(templateId)) {
  throw new Error(`Invalid template ID "${templateId}".`);
}

const metadataPath = path.join(
  repositoryRoot,
  'templates',
  templateId,
  'upkick.template.json',
);

const indexPath = path.join(repositoryRoot, 'templates.json');

const metadata = await readJson(metadataPath);
const index = await readJson(indexPath);

validateMetadata(metadata, templateId);

index.templates ??= {};

const existingTemplate = index.templates[templateId];

index.templates[templateId] = {
  name: metadata.name,
  description: metadata.description,
  latest: metadata.version,
  status: metadata.status,
  default: metadata.default,
  category: metadata.category,
  tags: metadata.tags,
  release: {
    tag: `${templateId}-v${metadata.version}`,
    archive: `${templateId}.tar.gz`,
    checksum: `${templateId}.sha256`,
    metadata: 'upkick.template.json',
  },
};

await validateSingleDefaultTemplate(index.templates, templateId);

await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');

console.log(
  existingTemplate
    ? `Updated "${templateId}" in templates.json to v${metadata.version}.`
    : `Added "${templateId}" to templates.json at v${metadata.version}.`,
);

async function readJson(filePath) {
  let contents;

  try {
    contents = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read ${filePath}`, {
      cause: error,
    });
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}`, {
      cause: error,
    });
  }
}

function validateMetadata(value, expectedTemplateId) {
  if (!value || typeof value !== 'object') {
    throw new Error('Template metadata must be an object.');
  }

  if (value.id !== expectedTemplateId) {
    throw new Error(
      [
        'Template ID does not match its directory.',
        `Expected: ${expectedTemplateId}`,
        `Received: ${String(value.id)}`,
      ].join('\n'),
    );
  }

  if (
    typeof value.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(value.version)
  ) {
    throw new Error(`Template "${expectedTemplateId}" has an invalid version.`);
  }

  if (typeof value.name !== 'string' || value.name.trim().length === 0) {
    throw new Error(`Template "${expectedTemplateId}" must have a name.`);
  }

  if (
    typeof value.description !== 'string' ||
    value.description.trim().length === 0
  ) {
    throw new Error(
      `Template "${expectedTemplateId}" must have a description.`,
    );
  }

  if (!Array.isArray(value.tags)) {
    throw new Error(`Template "${expectedTemplateId}" must have tags.`);
  }
}

async function validateSingleDefaultTemplate(templates, updatedTemplateId) {
  const defaultTemplates = Object.entries(templates)
    .filter(([, template]) => template.default === true)
    .map(([id]) => id);

  if (defaultTemplates.length > 1) {
    throw new Error(
      [
        'Only one template can be marked as default.',
        `Current default templates: ${defaultTemplates.join(', ')}`,
        `Updated template: ${updatedTemplateId}`,
      ].join('\n'),
    );
  }
}
