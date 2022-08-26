import { Guess } from './guess';
import { Guesser } from './guesser';

export class GuessSession {
    private readonly _guessSessionId: number;
    private readonly _guesses: Guess[];

    constructor(guessSessionId: number) {
        this._guessSessionId = guessSessionId;
        this._guesses = [];
    }

    get guesses(): Guess[] {
        return this._guesses;
    }

    public addGuessBy(guesser: Guesser, guess: number): void {
        for (const guess of this._guesses) {
            if (guess.guesser.user == guesser.user) {
                throw new Error('User already guessed');
            }
        }

        this._guesses.push(new Guess(guesser, this._guessSessionId, guess));
        guesser.addGuess();
    }
}
