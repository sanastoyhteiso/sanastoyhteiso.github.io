'use strict';
/** Offline structural inspection only. No I/O, migration or payload output.
 * Accept primitive JSON text, never caller-owned objects/getters/toJSON.
 * Only flat scalar objects are supported: maximum depth 1, six members.
 */
const LIMITS = Object.freeze({ maxBytes: 4096, maxMembers: 6, maxDepth: 1, maxStringLength: 64 });
const SCORE = Object.freeze(['correct', 'wrong', 'seen', 'last', 'learned', 'learnedUpdatedAt']);
const SCOPE = Object.freeze(['value', 'updatedAt']);
const REQUIRED_SCORE = SCORE.slice(0, 4);

function inspect(kind, jsonText) {
  const reject = code => Object.freeze({ ok: false, code });
  if (kind !== 'score' && kind !== 'scope') return reject('UNSUPPORTED_KIND');
  if (typeof jsonText !== 'string') return reject('JSON_TEXT_REQUIRED');
  if (jsonText.length > LIMITS.maxBytes || Buffer.byteLength(jsonText, 'utf8') > LIMITS.maxBytes)
    return reject('LIMIT_EXCEEDED');
  // Parse only the permitted grammar. Detect duplicate decoded keys before any
  // materialization; JSON.parse alone silently accepts duplicate members.
  let pos = 0;
  const keys = new Set();
  const allowed = kind === 'score' ? SCORE : SCOPE;
  const types = Object.create(null);
  const stop = code => { throw code; };
  const ws = () => { while (pos < jsonText.length && /[\x20\t\n\r]/.test(jsonText[pos])) pos++; };
  function take(char) { ws(); if (jsonText[pos++] !== char) stop('INVALID_JSON'); }
  function string() {
    const token = /"(?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/y;
    token.lastIndex = pos;
    const match = token.exec(jsonText);
    if (!match) stop('INVALID_JSON');
    pos = token.lastIndex;
    // Never include parser exceptions or the token in a public result.
    const result = JSON.parse(match[0]);
    if (result.length > LIMITS.maxStringLength) stop('LIMIT_EXCEEDED');
    return result;
  }
  function scalar() {
    ws();
    if (jsonText[pos] === '[' || jsonText[pos] === '{') stop('NESTING_NOT_ALLOWED');
    if (jsonText[pos] === '"') return string();
    const token = /(?:true|false|null|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/y;
    token.lastIndex = pos;
    const match = token.exec(jsonText);
    if (!match) stop('INVALID_JSON');
    pos = token.lastIndex;
    return JSON.parse(match[0]);
  }
  try {
    take('{'); ws();
    if (jsonText[pos] !== '}') {
      while (true) {
        ws();
        if (keys.size >= LIMITS.maxMembers) stop('LIMIT_EXCEEDED');
        const key = string();
        if (!allowed.includes(key)) stop('UNKNOWN_FIELD');
        if (keys.has(key)) stop('DUPLICATE_FIELD');
        keys.add(key); take(':');
        const value = scalar();
        if (key === 'learned') {
          if (typeof value !== 'boolean') stop('INVALID_TYPE');
        } else if (key === 'value') {
          if (typeof value !== 'string') stop('INVALID_TYPE');
          // Source family.js:setScope supports exactly these two preferences.
          if (value !== 'mine' && value !== 'all') stop('UNSUPPORTED_SCOPE');
        } else if (!Number.isSafeInteger(value) || value < 0 || Object.is(value, -0)) {
          stop('INVALID_NUMBER');
        }
        types[key] = typeof value;
        ws();
        if (jsonText[pos] !== ',') break;
        pos++;
      }
    }
    take('}'); ws();
    if (pos !== jsonText.length) stop('INVALID_JSON');
    const required = kind === 'score' ? REQUIRED_SCORE : SCOPE;
    if (required.some(key => !keys.has(key))) stop('MISSING_FIELD');
    // Canonical order, fixed field names/types only. No scores, timestamps,
    // true/false learned values, scope preferences, identifiers or raw JSON.
    return Object.freeze({
      ok: true, kind, fieldCount: keys.size,
      fields: Object.freeze(allowed.filter(key => keys.has(key)).map(name =>
        Object.freeze({ name, type: types[name] }))),
      automaticMigrationAllowed: false,
      sourceIntegrityVerified: false
    });
  } catch (error) {
    const codes = ['INVALID_JSON', 'LIMIT_EXCEEDED', 'NESTING_NOT_ALLOWED',
      'UNKNOWN_FIELD', 'DUPLICATE_FIELD', 'INVALID_TYPE', 'INVALID_NUMBER',
      'UNSUPPORTED_SCOPE', 'MISSING_FIELD'];
    return reject(codes.includes(error) ? error : 'INVALID_JSON');
  }
}
module.exports = Object.freeze({ LIMITS, inspect });
