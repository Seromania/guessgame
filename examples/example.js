const guessGame = require('../guessgame');

const game = new guessGame.GuessGame({
    guessMinimum: 0,
    guessMaximum: 10,
    guessPointsCorrectly: 3,
    guessPointsClosest: 2,
});

game.openGuess();
game.guess('chatter', 2);
game.guess('chatter 2', 3);
game.guess('chatter 3', 9);
let resultText = game.closeGuess(5);
console.log('result:', resultText);

game.openGuess();
game.guess('chatter', 2);
game.guess('chatter 2', 3);
game.guess('chatter 3', 9);
resultText = game.closeGuess(2);
console.log('result:', resultText);

game.openGuess();
game.guess('chatter', 2);
game.guess('chatter 2', 3);
game.guess('chatter 3', 9);
resultText = game.closeGuess(8);
console.log('result:', resultText);

console.log('Scoreboard:', game.getScoreBoard());
console.log('Score for \'chatter\':', game.getScoreOfUser('chatter'));
