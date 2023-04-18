import { useState } from "react";
import { exercise, trainingRecord, TAGSTYLE, BUTTONSTYLE } from "./constants";
import { checkDate, checkIntegerRange, validateDateString } from "./functions";

export function Settings({
  workout,
  updateWorkout,
  isActive,
  program,
  selectedProgram,
  updateProgram,
  isLoading,
  updateLoading,
  updateFetched,
  error,
  updateError,
}) {
  // component for setting the date and reps, input is disabled when it's used inside a new workout

  Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  // log workout no more than a week forward
  const maxDate = new Date().addDays(7).toLocaleDateString("fr-ca");

  const handleDate = (event) => {
    //handling date input

    const newDate = event.target.value;
    let newW = { ...workout };
    
    newW.date = newDate;    
    
    updateWorkout(newW);
  };

  const handleBlur = (event) => {
    //handling date input

    const newDate = event.target.value;
    let newW = { ...workout };

    let isDateCorrect = checkDate(newDate, 7);

    if (isDateCorrect.dateInRange == true) {
      error && updateError(false); // drop date error, if any
      newW.date = newDate;
    }
    else if(isDateCorrect.dateInRange == 'year'){
      error && updateError(false); // drop date error, if any
      newW.date = newDate;
      updateError(isDateCorrect.message);
    }
    else{
      updateError(isDateCorrect.message);
    }
    
    updateWorkout(newW);
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

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const handleSets = (event) => {
    //handling sets part of Reps input
    let newW = { ...workout };
    let newSets = event.target.value;
    let newRepsArr = newW.reps.split("x");

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newSets), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? (newRepsArr[0] = newSets)
      : updateError(inputCheck.message);

    newSets == "" && updateError("empty");

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const handleProgram = (event) => {
    const newProgram = event.target.value;
    updateProgram(newProgram);
  };

  const setRep = workout.reps.split("x"); //extracting sets and reps to an array

  // setting styles for the elements
  const buttonStyle = isActive
    ? "text-center px-5 py-3 m-1 text-black rounded-lg text-lg bg-gray-300"
    : BUTTONSTYLE;
  const tagStyle = isActive
    ? "bg-gray-300 w-1/3 text-center px-5 py-3 m-1 text-black rounded-lg font-display text-lg"
    : `${TAGSTYLE} w-1/3`;
  const smButtonStyle = isActive
    ? "bg-gray-300 text-center px-5 py-3 w-1/2 text-black rounded-lg text-lg"
    : `bg-sky-700 hover:bg-sky-900 text-center px-5 py-3 w-1/2 text-white rounded-lg text-lg`;

  const handleRest = (event) => {
    //handling date input
    const newRest = event.target.value;
    let newW = { ...workout };

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newRest), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? (newW.rest = newRest)
      : updateError(inputCheck.message);

    newRest == "" && updateError("empty");

    updateWorkout(newW);
  };

  return (
    <div name="settings" className="w-full">
      <div className="flex flex-row ">
        <div className={tagStyle}>Program</div>
        <select
          type="text"
          onChange={handleProgram}
          value={selectedProgram}
          className={`${buttonStyle} w-2/3 `}
          disabled={isActive}
        >
          {program.map((item, ind) => {
            return <option key={`pr-${ind}`}>{item}</option>;
          })}
        </select>
      </div>
      <div className="flex flex-row">
        <div className={tagStyle}>Date</div>
        <input
          type="date"
          max={maxDate}
          onChange={handleDate}
          onBlur={handleBlur}
          value={workout.date}
          className={`${buttonStyle} w-2/3 `}
          disabled={isActive}
        />
      </div>
      <div className="flex flex-row">
        <div className={`${tagStyle}`}>Reps</div>
        <div className="flex flex-row justify-between w-2/3 m-1">
          <input
            className={`${smButtonStyle} mr-1`}
            type="number"
            value={setRep[0]}
            onChange={handleSets}
            disabled={isActive}
          />
          <input
            className={`${smButtonStyle} ml-1`}
            type="number"
            value={setRep[1]}
            onChange={handleReps}
            disabled={isActive}
          />
        </div>
      </div>
      <div className="flex flex-row">
        <div className={tagStyle}>Rest (sec)</div>
        <input
          type="number"
          onChange={handleRest}
          value={workout.rest}
          className={`${buttonStyle} w-2/3 `}
          disabled={isActive}
        />
      </div>
    </div>
  );
}
