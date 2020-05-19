import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import terser from 'rollup-plugin-terser';

export default {
  input: 'src/cli.js',
  output: {
    file: 'lib/index.js',
    format: 'esm'
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    terser()
  ]
};
