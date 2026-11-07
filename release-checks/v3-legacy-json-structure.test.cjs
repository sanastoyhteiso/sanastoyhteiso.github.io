'use strict';
// All fixtures are artificial. Never read files, Sheets or learner records.
const test = require('node:test');
const assert = require('node:assert/strict');
const { inspect, LIMITS } = require('../backup-v3/legacy-json-structure.cjs');
const base = { correct: 2, wrong: 1, seen: 3, last: 100 };
const score = fields => JSON.stringify({ ...base, ...fields });
function blocked(kind, raw) {
  const result = inspect(kind, raw);
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result).sort(), ['code', 'ok']);
  assert.match(result.code, /^[A-Z_]+$/);
}
test('recognizes four counters and both learned fields, without their values', () => {
  const result = inspect('score', score({ learned: false, learnedUpdatedAt: 101 }));
  assert.equal(result.ok, true);
  assert.deepEqual(result.fields, [
    { name: 'correct', type: 'number' }, { name: 'wrong', type: 'number' },
    { name: 'seen', type: 'number' }, { name: 'last', type: 'number' },
    { name: 'learned', type: 'boolean' }, { name: 'learnedUpdatedAt', type: 'number' }
  ]);
  assert.equal(result.automaticMigrationAllowed, false);
  assert.equal(result.sourceIntegrityVerified, false);
  assert.equal(Object.isFrozen(result.fields[0]), true);
});
test('shape does not infer absent learned or hide an incomplete pair', () => {
  for (const fields of [{}, { learned: true }, { learnedUpdatedAt: 1 }]) {
    const result = inspect('score', score(fields));
    assert.equal(result.ok, true);
    assert.equal(result.fieldCount, 4 + Object.keys(fields).length);
    assert.equal(result.fields.some(x => x.name === 'learned'), 'learned' in fields);
    assert.equal(result.fields.some(x => x.name === 'learnedUpdatedAt'), 'learnedUpdatedAt' in fields);
  }
});
test('reports same shape for different counters, timestamps, manual flags and scopes', () => {
  assert.deepEqual(inspect('score', score({ learned: false, learnedUpdatedAt: 103 })),
    inspect('score', JSON.stringify({ correct: 999, wrong: 88, seen: 1087,
      last: 999999, learned: true, learnedUpdatedAt: 999999 })));
  assert.deepEqual(inspect('scope', '{"value":"mine","updatedAt":1}'),
    inspect('scope', '{"updatedAt":999999,"value":"all"}'));
  assert.equal(inspect('scope', '{"value":"all","updatedAt":0}').ok, true);
});
test('unknown fields and prototype keys fail closed without echo', () => {
  for (const key of ['email', 'uid', 'target_id', 'answer', 'fi', 'ru',
    '__proto__', 'constructor', 'prototype', 'synthetic_private_word']) {
    blocked('score', '{"' + key + '":"synthetic_canary@example.invalid"}');
  }
  blocked('scope', '{"value":"synthetic_canary@example.invalid","updatedAt":1}');
  assert.equal({}.polluted, undefined);
});
test('duplicate literal and escaped keys rejected before JSON overwrite', () => {
  for (const key of ['correct', 'co\\u0072rect'])
    blocked('score', '{"correct":1,"' + key + '":2,"wrong":0,"seen":1,"last":0}');
});
test('rejects nested objects, arrays, excessive strings, bytes and members', () => {
  for (const value of ['{}', '[]', '['.repeat(1000) + '0' + ']'.repeat(1000)])
    blocked('score', '{"correct":' + value + '}');
  blocked('score', ' '.repeat(LIMITS.maxBytes + 1));
  blocked('scope', '{"value":"' + 'x'.repeat(65) + '","updatedAt":0}');
  blocked('score', '"' + 'ä'.repeat(2500) + '"');
  blocked('score', score({ learned: true, learnedUpdatedAt: 1 }).slice(0, -1) + ',"correct":0}');
  assert.equal(inspect('score', JSON.stringify(base).padEnd(LIMITS.maxBytes, ' ')).ok, true);
});
test('rejects malformed JSON, missing fields, non-scalar roots and trailing content', () => {
  for (const raw of ['', '{}', 'null', '[]', 'true', '1', '"text"',
    '{"correct":01}', '{"correct":NaN}', '{"correct":Infinity}',
    '{"correct":1,}', '{"correct":1} {}', '{"correct":1/*x*/}',
    '{"correct":"\\x01"}', '{"correct":"\n"}']) blocked('score', raw);
  blocked('score', JSON.stringify(base) + ' trailing_private_canary');
  blocked('scope', '{"value":"mine"}');
  blocked('scope', '{"value":"mine","updatedAt":0,"learned":true}');
});
test('rejects wrong types and unsafe numbers for each numeric field', () => {
  for (const key of ['correct', 'wrong', 'seen', 'last', 'learnedUpdatedAt'])
    for (const value of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, null, true, '1', [], {}])
      blocked('score', score({ [key]: value }));
  for (const value of [0, 'true', null, [], {}]) blocked('score', score({ learned: value }));
  blocked('score', '{"correct":-0,"wrong":0,"seen":0,"last":0}');
  blocked('score', '{"correct":1e999,"wrong":0,"seen":0,"last":0}');
  blocked('scope', '{"value":true,"updatedAt":0}');
});
test('primitive-only API never invokes accessors, coercion or toJSON', () => {
  let invoked = false;
  const input = new Proxy({}, { get() { invoked = true; throw Error('private'); } });
  blocked('score', input); blocked(input, '{}');
  for (const raw of [null, undefined, 1, true, new String('{}')]) blocked('score', raw);
  blocked('unknown', '{}');
  assert.equal(invoked, false);
});
test('escaping and whitespace accepted; output frozen and independent of input ordering', () => {
  assert.deepEqual(inspect('score', ' \n {"co\\u0072rect":2,"last":100,"seen":3,"wrong":1}\t'),
    inspect('score', JSON.stringify(base)));
  assert.equal(Object.isFrozen(inspect('score', JSON.stringify(base))), true);
});
