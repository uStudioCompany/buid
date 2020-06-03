import buid from './buid';

(async () => {
  try {
    await buid({
      path: 'data.json'
    });
  } catch ({ message }) {
    console.log(message);
  }
})();
