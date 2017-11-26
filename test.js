const FastText = require('./FastText');

const ft = new FastText();
ft.loadModel('./mood_classifier.ftz', (err) => {
  // reportMood("I dont feel anything");

  // reportMood("I am missing my friends");
 
  // reportMood("I'm so sad");

  reportMood("I am enthralled");

  //reportMood("I hate everything");

  //reportMood("I'm fucking thrilled");
})

function reportMood(text) {
  console.log(text);
  ft.predict(text, 10).forEach(outputPrediciton);
  console.log('');
}

function outputPrediciton(pred) {
    console.log(`label: '${pred.label.replace('__label__', '')}' - probability: ${parseFloat((pred.probability * 100).toFixed(4))}% `);
}