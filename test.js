const FastText = require('./FastText');

const ft = new FastText();
ft.loadModel('./mood_classifier.ftz', (err) => {
  ft.predict();
})