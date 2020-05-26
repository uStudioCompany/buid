interface Options {
  file: string | object;
  path?: string[];
  skip?: string[];
  segmentLength?: number;
  verbose?: boolean;
}

declare function buid(options: Options): void;

export default buid;
