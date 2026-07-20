// Excludes visually ambiguous characters: 0/O, l/1/I.
const CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function generateClientPassword(length = 12): string {
  // Rejection sampling avoids modulo bias from mapping a byte onto a
  // charset whose length doesn't evenly divide 256.
  const max = Math.floor(256 / CHARSET.length) * CHARSET.length;
  const buf = new Uint8Array(1);
  let result = "";
  while (result.length < length) {
    crypto.getRandomValues(buf);
    if (buf[0] < max) result += CHARSET[buf[0] % CHARSET.length];
  }
  return result;
}
