import { Command } from 'commander';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { Transform, TransformCallback } from 'stream';

const program = new Command();

type OptionsType = {
  path: string;
  words: string[];
  destination: string;
};

type ChunkInfoType = {
  [key: string]: number;
};

program
  .option('-p, --path <path>', 'Path for file')
  .option('-w, --words [value...]', 'List of words to find')
  .option('-d, --destination <path>', 'Destination path file', './output')
  .parse();

const options: OptionsType = program.opts();

console.log(options);
const pathFile = path.resolve(options.path);
const words = [...options.words].sort();
const outputPathFile = path.resolve(options.destination);

const objChunkCountInfo: ChunkInfoType = words.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {});

const clearString = (str: string): string => {
  const regexp = new RegExp(/(\W|_)/, 'ig');
  return str.replace(regexp, '');
};

const checkWordChunk = (chunk: string, target: string): number => {
  if (chunk === null) {
    return 0;
  }
  const data = clearString(chunk);
  return (data.match(new RegExp(target, 'ig')) || []).length;
};

const readStream = createReadStream(pathFile, { encoding: 'utf8', highWaterMark: 1024 });
readStream.on('readable', () => {
  const chunk = readStream.read();
  for (const value of words) {
    const count = checkWordChunk(chunk, value);
    objChunkCountInfo[value] += count;
  }
});

readStream.on('end', () => {
  const transform = new Transform({
    transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
      console.log(chunk);
      callback(null, JSON.stringify(Object.values(chunk)));
    },
  });

  const writeStream = createWriteStream(outputPathFile, { encoding: 'utf8', highWaterMark: 1024 });
  writeStream.pipe(transform).write(objChunkCountInfo);
  console.log('RESULT: ', Object.assign({}, { ...objChunkCountInfo, arr: Object.values(objChunkCountInfo) }));
  writeStream.close();
});
