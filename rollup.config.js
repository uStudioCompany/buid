import hashbang from 'rollup-plugin-hashbang';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'index.js',
  output: {
    file: 'lib/index.js',
    format: 'cjs'
  },
  plugins: [hashbang(), terser()]
};
