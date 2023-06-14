import path from 'path';
import { readdir } from 'fs/promises';
import * as process from 'process';
import { Dirent } from 'fs';

type PathForDirType = string | Error;

const pathForDir: PathForDirType = process.argv[2]
  ? path.resolve(process.argv[2])
  : new Error('The path to the file is not specified');

const arr: string[] = [];

const reformatStr = (str: string): string => {
  if (typeof pathForDir !== 'string') throw new Error('The path to the file is not specified');

  const parsStr = path.parse(str);
  const count = parsStr.dir.match(/\\/g);
  if (count !== null) {
    return '\u2503' + '   '.repeat(count.length) + '\u2517\u257A\u257A\u257A' + parsStr.base;
  } else {
    return 'NOT DATE';
  }
};

const scanDir = async (pathDir: PathForDirType) => {
  if (typeof pathDir !== 'string') return pathForDir;
  const dir: Dirent[] = await readdir(pathDir, { encoding: 'utf8', withFileTypes: true, recursive: true });
  for (const value in dir) {
    if (typeof reformatStr(path.resolve(pathDir, dir[value].name)) === 'string')
      arr.push(reformatStr(path.resolve(pathDir, dir[value].name)));

    if (dir[value].isDirectory()) {
      await scanDir(path.resolve(pathDir, dir[value].name));
    }
  }
};

const createTree = (): string | Error => {
  let str = '';
  arr.forEach((el) => {
    str += `${el}\n`;
  });
  return str.length !== 0 ? str : new Error('The path to the file is not specified');
};

console.log('---START---');
await scanDir(pathForDir);
console.log(createTree());
console.log('---FINISH---');
