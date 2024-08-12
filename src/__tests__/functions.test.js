import "@testing-library/jest-dom";
import {
  checkDate,
  checkIntegerRange,
  validateDateString,
  validateValues,
} from "@/components/functions";
import "@/components";

describe("testing functions", () => {
  it("checks if date exists", () => {
    const validateDateStringTestCases = [
      { year: 2023, month: 4, day: 1, result: true },
      { year: 2021, month: 12, day: 10, result: true },
      { year: "2022", month: "12", day: "10", result: true },
      { year: "22", month: "12", day: "10", result: true },
      { year: "2022", month: "012", day: "00010", result: true },
      { year: "sddsf", month: "1f2", day: "10", result: false },
      { year: "20222", month: "12", day: "10", result: true },
      { year: "2022", month: "13", day: "10", result: false },
      { year: "2022", month: "02", day: "30", result: false },
      { year: "2023", month: "04", day: "31", result: false },
      { year: "2022", month: "012", day: "00f010", result: false },
    ];
    validateDateStringTestCases.forEach((testCase) => {
      expect(
        validateDateString(testCase.year, testCase.month, testCase.day)
      ).toEqual(testCase.result);
    });
  });

  it("checks if date is no more than a rangeDate days forward and no earlier that last year", () => {
    //checkDate(newDate (YYYY-MM-DD), rangeDate (int))
    //return { dateInRange: false, message: "Wrong Date" };
    // log workout no more than a rangeDate days forward and no earlier that last year
    const today = new Date().toLocaleDateString("fr-ca").split("-");
    let eightDays = new Date().addDays(8).toLocaleDateString("fr-ca");
    let fiveDays = new Date().addDays(5).toLocaleDateString("fr-ca");
    let oneYear = new Date().addDate(1, 0, 0).toLocaleDateString("fr-ca");
    const checkDateTestCases = [
      {
        newDate: "2000-05-11",
        rangeDate: 4,
        result: { dateInRange: "year", message: `It's ${today[0]}, Morty` },
      },
      {
        newDate: "0001-05-11",
        rangeDate: 7,
        result: { dateInRange: "year", message: `It's ${today[0]}, Morty` },
      },
      {
        newDate: `${today[0]}-${today[1]}-${today[2]}`,
        rangeDate: 7,
        result: { dateInRange: true, message: `The date is correct` },
      },
      {
        newDate: `${eightDays}`,
        rangeDate: 7,
        result: {
          dateInRange: false,
          message: `The date is more than a week away`,
        },
      },
      {
        newDate: `${fiveDays}`,
        rangeDate: 7,
        result: { dateInRange: true, message: `The date is correct` },
      },
      {
        newDate: `${oneYear}`,
        rangeDate: 7,
        result: {
          dateInRange: false,
          message: `The date is more than a week away`,
        },
      },
    ];
    checkDateTestCases.forEach((testCase) => {
      expect(checkDate(testCase.newDate, testCase.rangeDate)).toEqual(
        testCase.result
      );
    });
  });

  it("checks if integer is in range", () => {
    const checkIntegerRangeTestCases = [
      { input: 0, min: 0, max: 99, intInRange: true, message: "correct" },
      { input: 99, min: 0, max: 99, intInRange: true, message: "correct" },
      { input: 50, min: 0, max: 99, intInRange: true, message: "correct" },
      {
        input: -1,
        min: 0,
        max: 99,
        intInRange: false,
        message: "too small, min 0",
      },
      {
        input: -100000,
        min: 0,
        max: 99,
        intInRange: false,
        message: "too small, min 0",
      },
      {
        input: 100,
        min: 0,
        max: 99,
        intInRange: false,
        message: "too large, 99 max",
      },
      {
        input: 1000,
        min: 0,
        max: 99,
        intInRange: false,
        message: "too large, 99 max",
      },
      {
        input: 100,
        min: 0,
        max: 99,
        intInRange: false,
        message: "too large, 99 max",
      },
      {
        input: "1d00",
        min: 0,
        max: 99,
        intInRange: false,
        message: "1d00 is not integer",
      },
      {
        input: "1dsd098sd98f9ds80f90ds00",
        min: 0,
        max: 99,
        intInRange: false,
        message: "1dsd098sd98f9ds80f90ds00 is not integer",
      },
      {
        input: "100",
        min: 0,
        max: 99,
        intInRange: false,
        message: "100 is not integer",
      },
      {
        input: 50,
        min: 0,
        max: 99,
        intInRange: true,
        message: "correct",
      },
    ];
    //checkIntegerRange(input, min, max)
    //return { intInRange: false, message: `${input} is not integer` };
    checkIntegerRangeTestCases.forEach((testCase) => {
      expect(
        checkIntegerRange(testCase.input, testCase.min, testCase.max)
      ).toEqual({ intInRange: testCase.intInRange, message: testCase.message });
    });
  });

  it("checks if values are validated correctly", () => {
    //checking structure and normalizing type:
    //id	Date	Reps	Rest (sec)	[num, date, NumxNum, num]
    //exercises: [num]
    /* return { 
    value: result (bool),
    message: message(string),
    newValues: newValues([], new normalized array), 
    errorIndices:errorIndices ([bool], validation result on every 'values' element)} */
    const validateValuesTestCases = [
      {
        values: [
          "39",
          "2023-04-30",
          "2x15",
          "120",
          { workload: "120", name: "Squat" },
          { workload: "223", name: "Static lunge" },
          { workload: "77", name: "Barbell row" },
          { workload: "10", name: "Barbell press" },
          { workload: "0", name: "Running" },
        ],
        result: {
          value: true,
          message: "API: correct data",
          newValues: [
            39,
            "2023-04-30",
            "2x15",
            120,
            { workload: 120, name: "Squat" },
            { workload: 223, name: "Static lunge" },
            { workload: 77, name: "Barbell row" },
            { workload: 10, name: "Barbell press" },
            { workload: 0, name: "Running" },
          ],
          errorIndices: [true, true, true, true, true, true, true, true, true],
        },
      },
      {
        values: ["39", "2023-04-30"],
        result: {
          value: false,
          message: "API: not enough data to post",
          newValues: [],
          errorIndices: [],
        },
      },
      {
        values: ["39", "2023-04-30", "2x15", "120"],
        result: {
          value: false,
          message: "API: not enough data to post",
          newValues: [],
          errorIndices: [],
        },
      },
      {
        values: [
          "39",
          "2023-04-30",
          "2x15",
          "12df0",
          { workload: "120", name: "Squat" },
          { workload: "223", name: "Static lunge" },
          { workload: "77", name: "Barbell row" },
          { workload: "10", name: "Barbell press" },
          { workload: "0", name: "Running" },
        ],
        result: {
          value: false,
          message: "API: wrong data input",
          newValues: [
            39,
            "2023-04-30",
            "2x15",
            NaN,
            { workload: 120, name: "Squat" },
            { workload: 223, name: "Static lunge" },
            { workload: 77, name: "Barbell row" },
            { workload: 10, name: "Barbell press" },
            { workload: 0, name: "Running" },
          ],
          errorIndices: [true, true, true, false, true, true, true, true, true],
        },
      },
    ];
    validateValuesTestCases.forEach((testCase) => {
      expect(validateValues(testCase.values)).toEqual(testCase.result);
    });
  });
});
