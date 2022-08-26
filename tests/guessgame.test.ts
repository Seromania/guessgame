import { GuessGame, GuessGameOptions } from '../lib/guessgame';
import { expect } from 'chai';

describe('GuessGame', () => {
    const guessMaximum = 10;
    const guessMinimum = 5;
    const gameOptions = {
        guessMaximum,
        guessMinimum,
        guessPointsClosest: 1,
        guessPointsCorrectly: 2,
    } as GuessGameOptions;

    it('Should create game with closed guess', () => {
        const guessGame = new GuessGame(gameOptions);
        expect('GuessClosed', guessGame.state);
    });

    it('Should close guess', () => {
        const guessGame = new GuessGame(gameOptions);
        expect(() => guessGame.openGuess()).to.ok;
        expect(() => guessGame.closeGuess(6)).to.ok;
    });

    it('Should open second guess', () => {
        const guessGame = new GuessGame(gameOptions);
        expect(() => guessGame.openGuess()).to.ok;
        expect(() => guessGame.closeGuess(6)).to.ok;
        expect(() => guessGame.openGuess()).to.ok;
    });

    describe('Should guess', () => {
        it('Open guess', () => {
            const guessGame = new GuessGame(gameOptions);
            expect(() => guessGame.openGuess()).to.ok;
        });

        it('Should not allow guess, no guess open', () => {
            const guessGame = new GuessGame(gameOptions);
            expect(() => guessGame.guess('test', 5)).to.throws;
        });

        it('Should not allow guess, lower than minimum', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            expect(() => guessGame.guess('test', guessMinimum - 1)).to.throws;
        });

        it('Should not allow guess, higher than maximum', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            expect(() => guessGame.guess('test', guessMaximum + 1)).to.throws;
        });

        it('Should not allow guess, already guessed', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            guessGame.guess('test', guessMaximum);
            expect(() => guessGame.guess('test', guessMaximum)).to.throws;
        });

        it('Should add multiple guess from multiple chatters', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            guessGame.guess('test', guessMinimum);
            guessGame.guess('test 2', guessMaximum);
            expect(guessGame.getGuessesFromCurrentGuess().length).to.equal(2);
            expect(guessGame.getGuessesFromCurrentGuess().find(_ => _.guesser.user === 'test')).to.not.undefined;
            expect(guessGame.getGuessesFromCurrentGuess().find(_ => _.guesser.user === 'test 2')).to.not.undefined;
        });
    });

    describe('Closing guess', () => {
        it('Should close fine', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            expect(guessGame.closeGuess(guessMaximum)).to.equal('No guesses were found');
        });

        it('Should not close, final result too low', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            expect(() => guessGame.closeGuess(guessMinimum - 1)).to.throw('Final result was lower than guess minimum');
        });

        it('Should not close, final result too high', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            expect(() => guessGame.closeGuess(guessMaximum + 1)).to.throw('Final result was higher than guess maximum');
        });

        it('Should return user awarded correct points', () => {
            const guessGame = new GuessGame(gameOptions);
            const correctGuess = 6;
            const testUser = 'test';

            guessGame.openGuess();
            guessGame.guess(testUser, correctGuess);
            expect(guessGame.closeGuess(correctGuess)).to.equal(
                `Correct guess was ${correctGuess}, ${testUser} were correct and have been awarded ${gameOptions.guessPointsCorrectly} points`);
        });

        it('Should return user awarded closest points', () => {
            const guessGame = new GuessGame(gameOptions);
            const correctGuess = 6;
            const testUser = 'test';

            guessGame.openGuess();
            guessGame.guess(testUser, correctGuess - 1);
            expect(guessGame.closeGuess(correctGuess)).to.equal(
                `Correct guess was ${correctGuess}, ${testUser} were closest with the guess ${correctGuess - 1} and have been awarded ${gameOptions.guessPointsClosest} points`);
        });

        it('User test wins over user fail', () => {
            const guessGame = new GuessGame(gameOptions);
            const correctGuess = 6;
            const testUser = 'test';

            guessGame.openGuess();
            guessGame.guess(testUser, correctGuess - 1);
            guessGame.guess('fail', correctGuess + 1);
            expect(guessGame.closeGuess(correctGuess)).to.equal(
                `Correct guess was ${correctGuess}, ${testUser} were closest with the guess ${correctGuess - 1} and have been awarded ${gameOptions.guessPointsClosest} points`);
        });

        it('User test and test2 wins over user fail', () => {
            const guessGame = new GuessGame(gameOptions);
            const correctGuess = 6;
            const testUser = 'test';
            const testUser2 = 'test2';

            guessGame.openGuess();
            guessGame.guess(testUser, correctGuess - 1);
            guessGame.guess(testUser2, correctGuess - 1);
            guessGame.guess('fail', correctGuess + 1);
            expect(guessGame.closeGuess(correctGuess)).to.equal(
                `Correct guess was ${correctGuess}, ${testUser}, ${testUser2} were closest with the guess ${correctGuess - 1} and have been awarded ${gameOptions.guessPointsClosest} points`);
        });

        it('User test2 wins over user test', () => {
            const guessGame = new GuessGame(gameOptions);
            const correctGuess = 8;
            const testUser = 'test';
            const testUser2 = 'test2';

            guessGame.openGuess();
            guessGame.guess(testUser, correctGuess - 2);
            guessGame.guess(testUser2, correctGuess + 1);
            expect(guessGame.closeGuess(correctGuess)).to.equal(
                `Correct guess was ${correctGuess}, ${testUser2} were closest with the guess ${correctGuess + 1} and have been awarded ${gameOptions.guessPointsClosest} points`);
        });
    });

    describe('Test scoreboard', () => {
        it('Should have empty scoreboard', () => {
            const guessGame = new GuessGame(gameOptions);
            expect(guessGame.getScoreBoard()).to.length(0);
        });

        it('Should have test user with correct points', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.closeGuess(6);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.closeGuess(6);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.closeGuess(6);

            expect(guessGame.getScoreBoard()).to.length(1);
            expect(guessGame.getScoreBoard()[0].points).to.equal(gameOptions.guessPointsCorrectly * 3);
        });

        it('Both users should have multiple of closest points awarded', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.guess('test2', 6);
            guessGame.closeGuess(7);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.guess('test2', 6);
            guessGame.closeGuess(7);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.guess('test2', 6);
            guessGame.closeGuess(7);

            expect(guessGame.getScoreBoard()).to.length(2);
            expect(guessGame.getScoreBoard()[0].points).to.equal(gameOptions.guessPointsClosest * 3);
            expect(guessGame.getScoreBoard()[1].points).to.equal(gameOptions.guessPointsClosest * 3);
        });

        it('Get test user\'s scoreboard entry', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.guess('test2', 6);
            guessGame.closeGuess(7);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.guess('test2', 6);
            guessGame.closeGuess(7);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.guess('test2', 6);
            guessGame.closeGuess(7);

            const scoreBoardEntry = guessGame.getScoreOfUser('test');
            expect(scoreBoardEntry).to.be;
            expect(scoreBoardEntry.guesser).to.be;
            expect(scoreBoardEntry.guesser.user).to.equal('test');
            expect(scoreBoardEntry.guesser.amountGuesses).to.equal(3);
            expect(scoreBoardEntry.points).to.equal(gameOptions.guessPointsClosest * 3);
        });

        it('Get user with no points yet, should return undefined', () => {
            const guessGame = new GuessGame(gameOptions);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.guess('test2', 5);
            guessGame.closeGuess(8);
            guessGame.openGuess();
            guessGame.guess('test', 6);
            guessGame.guess('test2', 5);
            guessGame.closeGuess(8);

            const scoreBoardEntry = guessGame.getScoreOfUser('test2');
            expect(scoreBoardEntry).to.undefined;
        });

        it('Scoreboard should be in correct descending order', () => {
            const game = new GuessGame({
                guessMinimum: 0,
                guessMaximum: 10,
                guessPointsCorrectly: 3,
                guessPointsClosest: 2,
            });

            game.openGuess();
            game.guess('chatter', 2);
            game.guess('chatter 2', 3);
            game.guess('chatter 3', 9);
            game.closeGuess(5);

            game.openGuess();
            game.guess('chatter', 2);
            game.guess('chatter 2', 3);
            game.guess('chatter 3', 9);
            game.closeGuess(2);

            game.openGuess();
            game.guess('chatter', 2);
            game.guess('chatter 2', 3);
            game.guess('chatter 3', 9);
            game.closeGuess(8);

            const scoreBoardEntries = game.getScoreBoard();
            expect(scoreBoardEntries).to.length(3);
            expect(scoreBoardEntries[0].points).to.equal(3);
            expect(scoreBoardEntries[1].points).to.equal(2);
            expect(scoreBoardEntries[2].points).to.equal(2);
        })
    });
});
