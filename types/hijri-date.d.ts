declare module 'hijri-date' {
  export default class HijriDate {
    constructor();
    constructor(date: Date);
    constructor(dateString: string);
    constructor(timestamp: number);
    constructor(year: number, month: number, day: number);
    constructor(year: number, month: number, day: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number);
    getDate(): number;
    getMonth(): number;
    getFullYear(): number;
    toGregorian(): Date;
    toString(): string;
  }
}

