export function validateDateString(year, month, day) {
  // checking if the date exists. Eg Feb 30, Apr 31 and so on,
  let y = Number(year);
  y > 0 && y < 100 ? (y += 1900) : (y = y); // if year is from 0000 to 0100 it's treated like 19xx
  const m = Number(month) - 1;
  const d = Number(day);

  const validDate = new Date(y, m, d);

  //console.log(`year: ${year}, y: ${y}, validDate: ${validDate}`);

  let yearMatches = validDate.getFullYear() === y;
  let monthMatches = validDate.getMonth() === m;
  let dayMatches = validDate.getDate() === d;

  return yearMatches && monthMatches && dayMatches;
}

export function checkDate(newDate, rangeDate) {
  // log workout no more than a rangeDate days forward and no earlier that last year

  const today = new Date().toLocaleDateString("fr-ca").split("-");

  let input = newDate.split("-"); // [YYYY,MM,DD]
  //days between today and entered date
  let daysDiff = Math.floor(
    (Date.parse(newDate) - Date.parse(today)) / (1000 * 60 * 60 * 24) //days
  );
  console.log(input[0], input[1], input[2]);
  if (validateDateString(input[0], input[1], input[2])) {
    if (Math.abs(input[0] - today[0]) > 1) {
      //if input year is more than 1 year away from today
      return { dateInRange: "year", message: `It's ${today[0]}, Morty` };
    } else if (daysDiff > rangeDate) {
      return {
        dateInRange: false,
        message: `The date is more than a week away`,
      };
    } else {
      return {
        dateInRange: true,
        message: `The date is correct`,
      };
    }
  } else {
    return { dateInRange: false, message: "Wrong Date" };
  }
}

export function checkIntegerRange(input, min, max) {
  if (Number.isInteger(input)) {
    if (input > max) {
      return { intInRange: false, message: `too large, ${max} max` };
    } else if (input < min) {
      return { intInRange: false, message: `too small, min ${min}` };
    } else {
      return { intInRange: true, message: `correct` };
    }
  } else {
    return { intInRange: false, message: `${input} is not integer` };
  }
}

export function validateValues(values) {
  //checking structure and normalizing type:
  //id	Date	Reps	Rest (sec)	[num, date, NumxNum, num]
  //exercises: [num]
  /* return { 
    value: result (bool),
    message: message(string),
    newValues: newValues([], new normalized array), 
    errorIndices:errorIndices ([bool], validation result on every 'values' element)} */

  let message = "";
  let newValues = [...values];
  let errorIndices = [];

  console.log(values);
  if (values.length > 4) {
    let result = values.reduce((res, item, ind) => {
      let inRange;

      if (item === "") {
        return false;
      }
      console.log(`Reduce, ind = ${ind} item = ${item} result = ${res}`);

      if (ind === 0) {
        //id
        newValues[ind] = Number(item);
        inRange = checkIntegerRange(newValues[ind], 0, 500000); // 5.000.000 cells / 10 columns

        errorIndices.push(inRange.intInRange);
        return res && inRange.intInRange;
      } else if (ind === 1) {
        //date
        inRange = checkDate(item, 7);
        //the function can return 'year' in case of incorrect year, so we check for strict true:
        inRange.dateInRange = inRange.dateInRange === true ? true : false;

        errorIndices.push(inRange.dateInRange);
        return res && inRange.dateInRange;
      } else if (ind === 2) {
        //reps
        let repsArr = item.split("x");
        inRange = checkIntegerRange(Number(repsArr[0]), 1, 99);
        if (inRange.intInRange) {
          inRange = checkIntegerRange(Number(repsArr[1]), 1, 999);

          errorIndices.push(inRange.intInRange);
          return res && inRange.intInRange;
        } else {
          errorIndices.push(false);
          return false;
        }
      } else {
        //exercises and rest
        newValues[ind] = Number(item);
        inRange = checkIntegerRange(newValues[ind], 0, 999);

        errorIndices.push(inRange.intInRange);
        return res && inRange.intInRange;
      }
    }, true);
    console.log(newValues);
    message = result ? "API: correct data" : "API: wrong data input";
    return {
      value: result,
      message: message,
      newValues: newValues,
      errorIndices: errorIndices,
    };
  } else {
    return {
      value: false,
      message: "API: not enough data to post",
      newValues: [],
      errorIndices: [],
    };
  }
}

//extending Date object
Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  //console.log(date);
  return date;
};
//extending Date object
Date.prototype.addDate = function (years, months, days) {
  let date = new Date(this.valueOf());
  date.setFullYear(date.getFullYear() + years);
  date.setMonth(date.getMonth() + months);
  date.setDate(date.getDate() + days);
  //console.log(date);
  return date;
};


