import buid from './buid';

let data;

(async () => {
  data = await buid({
    file: 'data.json',
    write: ''
  });

  console.log(data);
})();
