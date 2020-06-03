interface Options {
  path: string | object;
  chain?: string[];
  fix?: boolean;
  skip?: string[];
  segmentLength?: number;
  verbose?: boolean;
}

declare function buid<O extends object>(options: Options): O | void;

export default buid;
