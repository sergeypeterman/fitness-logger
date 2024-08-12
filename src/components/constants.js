/* export function exercise(name, workload) {
  this.name = name;
  this.workload = workload;
} */

export class trainingRecord {
  constructor(id, date, reps, rest, exercises = []) {
    this.id = id;
    this.date = date;
    this.reps = reps;
    this.rest = rest;
    this.exercises = exercises;
  }
}

export const TAGSTYLE =
  "bg-sky-300 text-center py-3 m-1 text-black rounded-lg font-display text-lg";
export const BUTTONSTYLE =
  "bg-sky-700 hover:bg-sky-900 text-center px-5 py-3 m-1 text-white rounded-lg text-lg";
