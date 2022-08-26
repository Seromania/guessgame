import { Guesser } from './guesser';
import { GuessSession } from './guesssession';
import { Guess } from './guess';

export type GuessGameState = 'GuessClosed' | 'GuessOpen' | 'GuessClosing';

export interface GuessGameOptions {
    guessMinimum: number;
    guessMaximum: number;
    guessPointsCorrectly: number;
    guessPointsClosest: number;
}

export class ScoreBoardEntry {
    constructor(guesser: Guesser, points: number) {
        this._points = points;
        this._guesser = guesser;
    }

    private _points: number;

    public get points(): number {
        return this._points;
    }

    private readonly _guesser: Guesser;
    public get guesser(): Guesser {
        return this._guesser;
    }

    public addPoints(points: number): void {
        this._points += points;
    }
}

export class GuessGame {
    private _guessGameState: GuessGameState;
    private readonly _guessGameOptions: GuessGameOptions;
    private readonly _guessers: { [id: string]: Guesser };
    private _currentGuess: GuessSession | undefined;
    private _lastGuessId: number;
    private readonly _scoreBoard: ScoreBoardEntry[];

    constructor(guessGameOptions: GuessGameOptions) {
        this._guessGameOptions = {
            guessMaximum: 100,
            guessMinimum: 0,
            guessPointsCorrectly: 3,
            guessPointsClosest: 2,
            ...guessGameOptions,
        };
        this._guessGameState = 'GuessClosed';
        this._guessers = {};
        this._currentGuess = undefined;
        this._scoreBoard = [];
        this._lastGuessId = 0;
    }

    public get state(): GuessGameState {
        return this._guessGameState;
    }

    public getScoreOfUser(user: string): ScoreBoardEntry | undefined {
        return this._scoreBoard.find((entry: ScoreBoardEntry) => entry.guesser.user === user);
    }

    public getScoreBoard(): ScoreBoardEntry[] {
        return this._scoreBoard.sort((a: ScoreBoardEntry, b: ScoreBoardEntry) => a.points > b.points ? -1 : 1);
    }

    public openGuess(): void {
        if (this._guessGameState !== 'GuessClosed') {
            throw new Error('Guess is already opened');
        }

        this._lastGuessId += 1;
        this._currentGuess = new GuessSession(this._lastGuessId);
        this._guessGameState = 'GuessOpen';
    }

    public closeGuess(endNumber: number): string {
        if (this._guessGameState !== 'GuessOpen') {
            throw new Error('No guess to close');
        }
        if (endNumber < this._guessGameOptions.guessMinimum) {
            throw new Error('Final result was lower than guess minimum');
        }
        if (endNumber > this._guessGameOptions.guessMaximum) {
            throw new Error('Final result was higher than guess maximum');
        }

        this._guessGameState = 'GuessClosing';

        if (this._currentGuess.guesses.length === 0) {
            return 'No guesses were found';
        }

        const endResultText = this.awardPoints(endNumber);

        this._currentGuess = undefined;
        this._guessGameState = 'GuessClosed';

        return endResultText;
    }

    public guess(user: string, guess: number): void {
        if (this._guessGameState !== 'GuessOpen') {
            throw new Error('No guess is open');
        }

        this._currentGuess.addGuessBy(this.getGuesser(user), guess);
    }

    public getGuessesFromCurrentGuess(): Guess[] {
        if (this._guessGameState !== 'GuessOpen') {
            return [];
        }
        return this._currentGuess.guesses;
    }

    private getGuesser(user: string): Guesser {
        let guesser = this._guessers[user];
        if (!guesser) {
            guesser = new Guesser(user);
            this._guessers[user] = guesser;
        }

        return guesser;
    }

    private awardPoints(correctNumber: number): string {
        const sortedGuesses = this._currentGuess.guesses.sort((a: Guess, b: Guess) => a.guess - b.guess);
        const closestGuess = sortedGuesses.reduce((prev: Guess, curr: Guess) => {
            return (Math.abs(curr.guess - correctNumber) < Math.abs(prev.guess - correctNumber) ? curr : prev);
        });
        const allClosestGuesses = this._currentGuess.guesses.filter((guess: Guess) => guess.guess === closestGuess.guess);
        const correctGuess = closestGuess.guess === correctNumber;

        for (const entry of allClosestGuesses) {
            let scoreBoardEntry = this._scoreBoard.find((scoreBoardEntry: ScoreBoardEntry) => scoreBoardEntry.guesser.user === entry.guesser.user);
            if (!scoreBoardEntry) {
                scoreBoardEntry = new ScoreBoardEntry(entry.guesser, 0);
                this._scoreBoard.push(scoreBoardEntry);
            }

            scoreBoardEntry.addPoints(correctGuess ? this._guessGameOptions.guessPointsCorrectly : this._guessGameOptions.guessPointsClosest);
        }

        let returnString = `Correct guess was ${correctNumber}, ${allClosestGuesses.map((guess: Guess) => guess.guesser.user).join(', ')} `;
        if (!!correctGuess) {
            returnString += `were correct and have been awarded ${this._guessGameOptions.guessPointsCorrectly} points`;
        } else {
            returnString += `were closest with the guess ${closestGuess.guess} and have been awarded ${this._guessGameOptions.guessPointsClosest} points`;
        }
        return returnString;
    }
}
