declare module 'hijri-date' {
  export default class HijriDate {
    constructor(date?: Date | string | number | [number, number, number]);
    constructor(year: number, month: number, day: number);
    getDate(): number;
    getMonth(): number;
    getFullYear(): number;
    toGregorian(): Date;
    toString(): string;
  }
}

