export function checkDate(newDate, rangeDate) {
    // log workout no more than a rangeDate forward

    const today = new Date().toLocaleDateString("fr-ca").split("-");

    let input = newDate.split("-"); // [YYYY,MM,DD]
    //days between today and entered date
    let daysDiff = Math.floor(
      (Date.parse(newDate) - Date.parse(today)) / (1000 * 60 * 60 * 24)
    );
    console.log(input[0], input[1], input[2]);
    if (validateDateString(input[0], input[1], input[2])) {
      if (Math.abs(input[0] - today[0]) > 1) {

        //if input year is more than 1 year away from today
        return { dateInRange: 'year', message: `It's ${today[0]}, Morty` };
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

  export function validateDateString(year, month, day) {
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    const validDate = new Date(y, m, d);

    let yearMatches = validDate.getFullYear() == y;
    let monthMatches = validDate.getMonth() == m;
    let dayMatches = validDate.getDate() == d;

    return yearMatches && monthMatches && dayMatches;
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
  
    let message = "";
    let newValues = [...values];
  
    console.log(values);
    if (values.length > 0) {
      let result = values.reduce((res, item, ind) => {
        let inRange;
  
        console.log(`Reduce, ind = ${ind} item = ${item} result = ${res}`);
  
        if (ind === 0) {
          //id
          newValues[ind] = Number(item);
          inRange = checkIntegerRange(newValues[ind], 0, 500000); // 5.000.000 cells / 10 columns
          return res && inRange.intInRange;
        } else if (ind === 1) {
          //date
          inRange = checkDate(item, 7);
          inRange.dateInRange = inRange.dateInRange === true ? true : false;
          return res && inRange.dateInRange;
        } else if (ind === 2) {
          //reps
          let repsArr = item.split("x");
          inRange = checkIntegerRange(Number(repsArr[0]), 0, 99);
          if (inRange.intInRange) {
            inRange = checkIntegerRange(Number(repsArr[1]), 0, 999);
            return res && inRange.intInRange;
          } else {
            return false;
          }
        } else {
          //exercises and rest
          newValues[ind] = Number(item);
          inRange = checkIntegerRange(newValues[ind], 0, 999);
          return res && inRange.intInRange;
        }
      }, true);
      console.log(newValues);
      message = result ? "API: correct data" : "API: wrong data input";
      return { value: result, message: message, newValues: newValues };
    }
    else{
      return { value: false, message: "API: nothing to post", newValues: [] };
    }
  }