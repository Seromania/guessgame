export class Guesser {
    private readonly _user: string;

    constructor(user: string) {
        this._user = user;
        this._amountGuesses = 0;
    }

    private _amountGuesses: number;

    get amountGuesses(): number {
        return this._amountGuesses;
    }

    get user(): string {
        return this._user;
    }

    public addGuess(): void {
        this._amountGuesses += 1;
    }
}
