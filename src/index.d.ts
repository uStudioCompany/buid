interface Options {
  file: string | object;
  path?: string[];
  skip?: string[];
  segmentLength?: number;
  verbose?: boolean;
  write?: string;
}

declare function buid<O extends object>(options: Options): O | void;

export default buid;
