import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  access,
  copyFile,
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { create } from 'tar';

const currentFile = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(currentFile);
const repositoryRoot = path.resolve(scriptsDirectory, '..');

const templateId = process.argv[2];

if (!templateId) {
  throw new Error(
    'Template ID is required. Example: node scripts/package-template.mjs base',
  );
}

validateTemplateId(templateId);

const templateDirectory = path.join(repositoryRoot, 'templates', templateId);

const metadataPath = path.join(templateDirectory, 'upkick.template.json');

await ensurePathExists(
  templateDirectory,
  `Template directory was not found: templates/${templateId}`,
);

await ensurePathExists(
  metadataPath,
  `Template metadata was not found: templates/${templateId}/upkick.template.json`,
);

const metadata = await readTemplateMetadata(metadataPath);

validateTemplateMetadata(metadata, templateId);

const outputDirectory = path.join(
  repositoryRoot,
  'dist',
  templateId,
  metadata.version,
);

const archiveName = `${templateId}.tar.gz`;
const checksumName = `${templateId}.sha256`;

const archivePath = path.join(outputDirectory, archiveName);
const checksumPath = path.join(outputDirectory, checksumName);
const metadataOutputPath = path.join(outputDirectory, 'upkick.template.json');

await rm(outputDirectory, {
  recursive: true,
  force: true,
});

await mkdir(outputDirectory, {
  recursive: true,
});

console.log(
  `Packaging template "${templateId}" version ${metadata.version}...`,
);

await create(
  {
    gzip: true,
    cwd: templateDirectory,
    file: archivePath,
    portable: true,
    noMtime: true,
    filter: shouldIncludeArchiveEntry,
  },
  ['.'],
);

const checksum = await calculateSha256(archivePath);

await writeFile(checksumPath, `${checksum}  ${archiveName}\n`, 'utf8');

await copyFile(metadataPath, metadataOutputPath);

console.log('');
console.log('Template packaged successfully:');
console.log(`  Archive:  ${relativeToRoot(archivePath)}`);
console.log(`  Checksum: ${relativeToRoot(checksumPath)}`);
console.log(`  Metadata: ${relativeToRoot(metadataOutputPath)}`);
console.log(`  Release:  ${templateId}-v${metadata.version}`);

function validateTemplateId(value) {
  if (!/^[a-z0-9-]+$/.test(value)) {
    throw new Error(
      `Invalid template ID "${value}". Use lowercase letters, numbers, and hyphens only.`,
    );
  }
}

async function readTemplateMetadata(filePath) {
  let contents;

  try {
    contents = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read template metadata: ${filePath}`, {
      cause: error,
    });
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new Error(`Template metadata contains invalid JSON: ${filePath}`, {
      cause: error,
    });
  }
}

function validateTemplateMetadata(metadata, expectedTemplateId) {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Template metadata must be a JSON object.');
  }

  if (metadata.id !== expectedTemplateId) {
    throw new Error(
      [
        'Template ID does not match its directory name.',
        `Directory: ${expectedTemplateId}`,
        `Metadata: ${String(metadata.id)}`,
      ].join('\n'),
    );
  }

  if (
    typeof metadata.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(metadata.version)
  ) {
    throw new Error(
      `Template "${expectedTemplateId}" must have a valid semantic version.`,
    );
  }

  if (typeof metadata.name !== 'string' || metadata.name.trim().length === 0) {
    throw new Error(`Template "${expectedTemplateId}" must have a name.`);
  }
}

function shouldIncludeArchiveEntry(entryPath) {
  const normalizedPath = entryPath.replaceAll('\\', '/').replace(/^\.\//, '');

  const excludedSegments = new Set([
    'node_modules',
    '.next',
    '.turbo',
    'dist',
    'coverage',
  ]);

  const segments = normalizedPath.split('/');

  if (segments.some((segment) => excludedSegments.has(segment))) {
    return false;
  }

  const filename = segments.at(-1);

  if (
    filename === '.env' ||
    filename === '.env.local' ||
    filename?.endsWith('.log')
  ) {
    return false;
  }

  return true;
}

async function calculateSha256(filePath) {
  const hash = createHash('sha256');
  const stream = createReadStream(filePath);

  for await (const chunk of stream) {
    hash.update(chunk);
  }

  return hash.digest('hex');
}

async function ensurePathExists(targetPath, errorMessage) {
  try {
    await access(targetPath);
  } catch {
    throw new Error(errorMessage);
  }
}

function relativeToRoot(targetPath) {
  return path.relative(repositoryRoot, targetPath);
}
