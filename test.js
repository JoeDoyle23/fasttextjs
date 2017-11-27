const FastText = require('./FastText');

const ft = new FastText();
ft.loadModel('./amazon_review_full.ftz', (err) => {
  reportMood("hated it"); // 1 star review
  reportMood("it was ok"); // 3 star review
  reportMood("best product ever"); // 5 star review
})

function reportMood(text) {
  console.log(text);
  ft.predict(text, 10).forEach(outputPrediciton);
  console.log('');
}

function outputPrediciton(pred) {
    console.log(`label: '${pred.label.replace('__label__', '')}' - probability: ${parseFloat((pred.probability * 100).toFixed(4))}% `);
}