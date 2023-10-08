const statRegex = /(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/;

export function parseGitStats(statsString: string) {
  const match = statsString?.match(statRegex);
  if (match) {
    const [, files, add, del] = match.map(Number);
    return { files, add: add || 0, del: del || 0 };
  }
  return { files: 0, add: 0, del: 0 };
}

const contribRegex = /(\d+)(.*?)<(.*?)>/;

export function parseContributor(contribString: string) {
  const match = contribString.match(contribRegex);
  if (match) {
    const [, n, name, email] = match;
    return { n: +n, name: name.trim(), email };
  }
  return null;
}

const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

export function alphanum(...strings: string[]) {
  return strings.every((s) => s.match(ALPHANUMERIC_REGEX));
}
