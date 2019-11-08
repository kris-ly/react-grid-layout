const flow2ts = require('@dylanvann/flow-to-typescript');
const {
    readFileSync, writeFileSync, readdirSync, statSync,
} = require('fs');
const path = require('path');

const { compile } = flow2ts;

const rootPath = 'lib/';
const destPath = 'src/';

function findPath(filePath, resArray = []) {
    const files = readdirSync(filePath);
    files.forEach((fileName) => {
        const dir = path.join(filePath, fileName);
        const stat = statSync(dir);
        if (stat.isFile()) {
            resArray.push(dir);
        }
        if (stat.isDirectory()) {
            findPath(dir, resArray);
        }
    });
    return resArray;
}

console.time('Compiled success in');
const paths = findPath(rootPath);
paths.forEach((filePath) => {
    console.log('filePath', filePath);

    const file = readFileSync(filePath, 'utf-8');
    // 未做文件夹是否存在的判断
    compile(file, filePath).then(ts => writeFileSync(
        filePath.replace(rootPath, destPath).replace('.js', '.ts'),
        ts,
    ));
});
console.timeEnd('Compiled success in');
