import { useEffect, useRef } from "react";
import { TAGSTYLE } from "./constants";
import { checkDate, checkIntegerRange, PopulateWorkout } from "./functions";
import "./functions";

export function Settings({
  workout,
  updateWorkout,
  program,
  selectedProgram,
  updateSelectedProgram,
  isLoading,
  updateLoading,
  updateFetched,
  error,
  updateError,
  resetWorkout,
  isFetched,
}) {
  // component for setting the date, reps, and rest period

  // for changing classnames on the fly
  const dateRef = useRef();
  const repsRef = useRef();
  const setsRef = useRef();
  const restRef = useRef();

  //loading default program
  useEffect(() => {
    if (isFetched === 2) {
      updateLoading(true); //loading...
      console.log(`sent from settings: ${selectedProgram}`);
      fetch(`/api/workouts-db?selected=${selectedProgram}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          const { headers, values } = data;
          console.log(headers);
          console.log(values);
          const newWorkout = PopulateWorkout(workout, headers, values);
          console.log(newWorkout);
          updateWorkout(newWorkout);
          updateFetched(1);
        })
        .catch((error) => {
          console.error(error);
          updateError({
            error: true,
            message: error.message,
          });
        });
      updateLoading(false);
    }
  }, [isFetched]);

  // log workout no more than a week forward,
  // fr-ca for a format compatible with <input date>
  const maxDate = new Date().addDays(7).toLocaleDateString("fr-ca");

  const handleDate = (event) => {
    //handling date input, no more than 7 days forward

    const newDate = event.target.value;
    let newW = { ...workout };

    let isDateCorrect = checkDate(newDate, 7);
    if (isDateCorrect.dateInRange) {
      dateRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3 `;
    }

    newW.date = newDate;

    updateWorkout(newW);
  };

  const handleDateBlur = (event) => {
    //handling date input on switching input fields

    const newDate = event.target.value;
    let newW = { ...workout };

    //check if date is no more than a week forward or a year+ back
    let isDateCorrect = checkDate(newDate, 7);

    if (isDateCorrect.dateInRange == true) {
      error && updateError(false); // drop error, if any
      newW.date = newDate;
    } else {
      updateError(isDateCorrect.message);
    }

    if (isDateCorrect.dateInRange === true) {
      dateRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3 `;
      updateWorkout(newW);
    } else {
      dateRef.current.focus();
      dateRef.current.className = `${buttonStyle} bg-rose-700 hover:bg-rose-900 w-2/3 `;
    }
  };

  const handleReps = (event) => {
    //handling reps part of Reps input
    let newW = { ...workout };
    let newReps = event.target.value;
    let newRepsArr = newW.reps.split("x");

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newReps), 0, 99); //check if input is correct
    inputCheck.intInRange
      ? (newRepsArr[1] = newReps)
      : updateError(inputCheck.message);

    newReps == "" && updateError("Check Reps value");
    if (inputCheck.intInRange) {
      repsRef.current.className = `${smButtonStyle} bg-sky-700 hover:bg-sky-900 ml-1`;
    }

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const handleRepsBlur = (event) => {
    //handling reps part of Reps input on blur
    let newW = { ...workout };
    let newReps = event.target.value;
    let newRepsArr = newW.reps.split("x");

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newReps), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? (newRepsArr[1] = newReps)
      : updateError(inputCheck.message);

    newReps == "" && updateError("Check Reps value");

    if (!inputCheck.intInRange || newReps == "") {
      repsRef.current.focus();
      repsRef.current.className = `${smButtonStyle} bg-rose-700 hover:bg-rose-900 ml-1`;
    } else {
      repsRef.current.className = `${smButtonStyle} bg-sky-700 hover:bg-sky-900 ml-1`;
      newW.reps = newRepsArr.join("x");

      updateWorkout(newW);
    }
  };

  const handleSets = (event) => {
    //handling sets part of Reps input
    let newW = { ...workout };
    let newSets = event.target.value;
    let newRepsArr = newW.reps.split("x");

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newSets), 0, 99); //check if input is correct
    inputCheck.intInRange
      ? (newRepsArr[0] = newSets)
      : updateError(inputCheck.message);

    newSets == "" && updateError("Check Sets value");
    if (inputCheck.intInRange) {
      setsRef.current.className = `${smButtonStyle} bg-sky-700 hover:bg-sky-900 mr-1`;
    }

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const handleSetsBlur = (event) => {
    //handling sets part of Reps input on blur
    let newW = { ...workout };
    let newSets = event.target.value;
    let newRepsArr = newW.reps.split("x");

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newSets), 0, 99); //check if input is correct
    inputCheck.intInRange
      ? (newRepsArr[0] = newSets)
      : updateError(inputCheck.message);

    newSets == "" && updateError("Check Sets value");

    if (!inputCheck.intInRange || newSets == "") {
      setsRef.current.focus();
      setsRef.current.className = `${smButtonStyle} bg-rose-700 hover:bg-rose-900 mr-1`;
    } else {
      setsRef.current.className = `${smButtonStyle} bg-sky-700 hover:bg-sky-900 mr-1`;
      newW.reps = newRepsArr.join("x");

      updateWorkout(newW);
    }
  };

  const handleProgram = async (event) => {
    // handling program change => download a new one from the sheet
    const newProgram = event.target.value;

    updateSelectedProgram(newProgram);
    try {
      /*Loading last workout of the selected program on "Log New Workout"
      to ease the new input for the user.*/
      //May be rewrited to choose a training based on reps scheme
      //omitting date, reps and rest

      updateLoading(true); //loading...
      const response = await fetch(`/api/workouts-db?selected=${newProgram}`, {
        method: "GET",
      });
      if (!response.ok) {
        console.log(response.statusText);
        throw new Error(response.statusText);
      }

      //handling the response. headers: table headers, values: corresponding values of the last workout
      const results = await response.json();
      const { headers, values } = results;
      console.log(headers, values);
      const newWorkout = PopulateWorkout(workout, headers, values);
      //newWorkout.exercises.length = 0;

      //updating state: workout and 'fetched' flag, loading is done
      updateWorkout(newWorkout);
      //updateFetched(true);
      updateLoading(false);
    } catch (err) {
      console.log("error.message handleProgram: " + err.message);
      updateError({
        error: true,
        message: err.message,
      });
    }
  };

  const setRep = workout.reps.split("x"); //extracting sets and reps to an array

  // setting styles for the elements
  const buttonStyle = "text-center px-5 py-3 m-1 text-white rounded-lg text-lg";
  const tagStyle = false
    ? "bg-gray-300 w-1/3 text-center px-5 py-3 m-1 text-black rounded-lg font-display text-lg"
    : `${TAGSTYLE} w-1/3`;
  const smButtonStyle = `text-center px-5 py-3 w-1/2 text-white rounded-lg text-lg`;

  const handleRest = (event) => {
    //handling Rest input
    const newRest = event.target.value;
    let newW = { ...workout };

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newRest), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? (newW.rest = newRest)
      : updateError(inputCheck.message);

    newRest == "" && updateError("Check Rest' value");

    if (inputCheck.intInRange) {
      restRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3`;
    }

    updateWorkout(newW);
  };

  const handleRestBlur = (event) => {
    //handling Rest input on blur
    const newRest = event.target.value;
    let newW = { ...workout };

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newRest), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? (newW.rest = newRest)
      : updateError(inputCheck.message);

    newRest == "" && updateError("Check Rest' value");

    if (!inputCheck.intInRange || newRest === "") {
      restRef.current.className = `${buttonStyle} bg-rose-700 hover:bg-rose-900 w-2/3`;
      restRef.current.focus();
    } else {
      restRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3`;
      newW.rest = newRest;
      updateWorkout(newW);
    }
  };

  return (
    <div id="settings" className="w-full">
      <div className="flex flex-row ">
        <label htmlFor="program-selector" className={tagStyle}>
          Program
        </label>
        <select
          name="programSelector"
          id="program-selector"
          onChange={handleProgram}
          value={selectedProgram}
          className={`${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3 `}
        >
          {program.map((item, ind) => {
            return <option key={`pr-${ind}`}>{item}</option>;
          })}
        </select>
      </div>
      <div className="flex flex-row">
        <label htmlFor="date-selector" className={tagStyle}>
          Date
        </label>
        <input
          type="date"
          name="dateSelector"
          id="date-selector"
          max={maxDate}
          onChange={handleDate}
          onBlur={handleDateBlur}
          value={workout.date}
          className={`${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3 `}
          ref={dateRef}
        />
      </div>
      <form className="flex flex-row">
        <label id="repsSetsSelector" className={`${tagStyle}`}>
          Reps x Sets
        </label>
        <div className="flex flex-row justify-between w-2/3 m-1">
          <input
            name="setsSelector"
            className={`${smButtonStyle} bg-sky-700 hover:bg-sky-900 mr-1`}
            type="number"
            value={setRep[0]}
            placeholder="0-99"
            onChange={handleSets}
            onBlur={handleSetsBlur}
            ref={setsRef}
            aria-labelledby="repsSetsSelector"
          />
          <input
            name="repsSelector"
            className={`${smButtonStyle} bg-sky-700 hover:bg-sky-900 ml-1`}
            type="number"
            value={setRep[1]}
            placeholder="0-99"
            onChange={handleReps}
            onBlur={handleRepsBlur}
            ref={repsRef}
            aria-labelledby="repsSetsSelector"
          />
        </div>
      </form>
      <div className="flex flex-row">
        <label htmlFor="rest-selector" className={tagStyle}>
          Rest (sec)
        </label>
        <input
          name="restSelector"
          id="rest-selector"
          type="number"
          placeholder="0-999"
          onChange={handleRest}
          onBlur={handleRestBlur}
          value={workout.rest}
          className={`${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3 `}
          ref={restRef}
        />
      </div>
    </div>
  );
}
