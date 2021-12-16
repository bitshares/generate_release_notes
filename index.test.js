const process = require('process');
const cp = require('child_process');
const path = require('path');

test('test runs', () => {
    process.env['INPUT_TEMPLATE'] = '';
    process.env['INPUT_CATEGORIES'] = '[{"title":"New features","labels":["feature","enhancement"]},{"title":"Bug fixes and improvements","labels":["bug"]}]';
    const ip = path.join(__dirname, 'index.js');
    const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
    console.log(result);
})