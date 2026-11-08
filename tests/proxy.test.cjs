const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const proxy = require('../proxy.conf.cjs');
const xml = fs.readFileSync(path.join(__dirname, '../public/web.config'), 'utf8');
const expected = {
  login: 'GetIConnectLogin', tracking: 'TrackDetails',
  'reference-search': 'AWBSearchDetailed', 'reference-options': 'GetHelpData',
  complaints: 'SearchQuery', 'complaint-types': 'MasterList',
  'complaint-number': 'GetNewComplaintNo', 'account-details': 'GetAccountDetails',
  'create-complaint': 'CreateComplaint',
};

test('all BANKMISR aliases have matching development and IIS destinations', () => {
  assert.equal(Object.keys(proxy).length, Object.keys(expected).length);
  for (const [alias, endpoint] of Object.entries(expected)) {
    const pattern = `^/BANKMISR/${alias}$`;
    const route = proxy[pattern];
    assert.ok(route, alias);
    assert.equal(route.secure, true);
    assert.equal(route.changeOrigin, true);
    const requestPath = `/BANKMISR/${alias}`;
    const upstreamPath = requestPath.replace(new RegExp(pattern), route.pathRewrite[pattern]);
    assert.equal(upstreamPath, `/IconnectSecure/IntegraOntrackService.svc/${endpoint}`);
    const rule = xml.match(new RegExp(`<rule name="BANKMISR ${alias}"[\\s\\S]*?</rule>`))?.[0];
    assert.ok(rule, alias);
    assert.ok(rule.includes(`url="^BANKMISR/${alias}$"`));
    assert.ok(rule.includes('pattern="^POST$"'));
    assert.ok(rule.includes(`url="${route.target}${upstreamPath}"`));
    assert.ok(rule.includes('type="Rewrite"'));
    assert.ok(!new RegExp(pattern).test(requestPath + '/other'));
  }
});

test('frontend uses BANKMISR routes and contains no original service URL', () => {
  const root = path.join(__dirname, '../src');
  let content = '';
  function walk(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) walk(file);
      else content += fs.readFileSync(file, 'utf8') + '\n';
    }
  }
  walk(root);
  assert.doesNotMatch(content, /egxpress\.me|IconnectSecure|IntegraOntrackService/);
  for (const alias of Object.keys(expected)) assert.ok(content.includes(`/BANKMISR/${alias}`), alias);
});

test('unknown API paths are rejected before SPA fallback', () => {
  const reject = xml.indexOf('name="Reject unknown BANKMISR requests"');
  const fallback = xml.indexOf('name="Angular routes"');
  assert.ok(reject > 0 && reject < fallback);
  assert.ok(xml.slice(reject, fallback).includes('statusCode="404"'));
  assert.ok(!Object.values(proxy).some(route => route.secure === false));
});
