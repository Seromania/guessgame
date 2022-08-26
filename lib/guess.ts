import { Guesser } from './guesser';

export class Guess {
    private readonly _guesser: Guesser;
    private readonly _guessSessionId: number;
    private readonly _guess: number;

    constructor(guesser: Guesser, guessSessionId: number, guess: number) {
        this._guesser = guesser;
        this._guessSessionId = guessSessionId;
        this._guess = guess;
    }

    get guesser(): Guesser {
        return this._guesser;
    }

    get guessSessionId(): number {
        return this._guessSessionId;
    }

    get guess(): number {
        return this._guess;
    }
}
