import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
const cryptoNode = require('crypto');

Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder, writable: true });
Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder, writable: true });

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: cryptoNode.webcrypto, writable: true });
}
