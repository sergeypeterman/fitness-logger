import { useEffect, useRef } from "react";
import { exercise, trainingRecord, TAGSTYLE, BUTTONSTYLE } from "./constants";
import { checkDate, checkIntegerRange } from "./functions";

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
  // component for setting the date and reps, input is disabled when it's used inside a new workout

  const dateRef = useRef();
  const repsRef = useRef();
  const setsRef = useRef();
  const restRef = useRef();

  useEffect(() => {
    if (isFetched === 0 || isFetched === 2) {
      updateLoading(true); //loading...
      console.log(`sent from settings: ${selectedProgram}`);
      fetch(`/api/training-data?selected=${selectedProgram}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          const { headers, values } = data;
          const newWorkout = { ...workout };
          // resetting exercises to avoid duplicating
          if (headers.length > 0) {
            newWorkout.exercises.length = 0;
          }
          //populating workout with the exercises' data and a new id
          headers.map((item, ind) => {
            if (ind === 0) {
              // id
              newWorkout.id = Number(values[0]) + 1; // new id
              console.log("new id: " + newWorkout.id);
            } else if (ind === 1) {
              /* date. Skipping old date 
          let oldDate = new Date(values[1]).toLocaleDateString("fr-ca");
          newWorkout.date = oldDate; */
            } else if (ind === 2) {
              // reps
              //newWorkout.reps = values[2]; skipping old reps
            } else if (ind === 3) {
              // rest
              //newWorkout.rest = values[3]; skipping old rest
            } else {
              let ex = new exercise(item, values[ind]);
              newWorkout.exercises.push(ex);
            }
          });
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

    let isDateCorrect = checkDate(newDate, 7);
    if (isDateCorrect.dateInRange) {
      dateRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3 `;
      
    }

    newW.date = newDate;

    updateWorkout(newW);
  };

  const handleDateBlur = (event) => {
    //handling date input

    const newDate = event.target.value;
    let newW = { ...workout };

    let isDateCorrect = checkDate(newDate, 7);

    if (isDateCorrect.dateInRange == true) {
      error && updateError(false); // drop date error, if any
      newW.date = newDate;
    } else if (isDateCorrect.dateInRange == "year") {
      error && updateError(false); // drop date error, if any
      newW.date = newDate;
      updateError(isDateCorrect.message);
    } else {
      updateError(isDateCorrect.message);
    }

    if (isDateCorrect.dateInRange) {
      dateRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3 `;
      updateWorkout(newW);      
    }
    else{
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

    newReps == "" && updateError("Reps are empty");
    if (inputCheck.intInRange) {
      repsRef.current.className = `${smButtonStyle} bg-sky-700 hover:bg-sky-900 ml-1`;
    }

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const handleRepsBlur = (event) => {
    let newW = { ...workout };
    let newReps = event.target.value;
    let newRepsArr = newW.reps.split("x");

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newReps), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? (newRepsArr[1] = newReps)
      : updateError(inputCheck.message);

    newReps == "" && updateError("Reps are empty");

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

    newSets == "" && updateError("Sets are empty");
    if (inputCheck.intInRange) {
      setsRef.current.className = `${smButtonStyle} bg-sky-700 hover:bg-sky-900 mr-1`;
    }

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const handleSetsBlur = (event) => {
    let newW = { ...workout };
    let newSets = event.target.value;
    let newRepsArr = newW.reps.split("x");

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newSets), 0, 99); //check if input is correct
    inputCheck.intInRange
      ? (newRepsArr[0] = newSets)
      : updateError(inputCheck.message);

    newSets == "" && updateError("Sets are empty");

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
    const newProgram = event.target.value;

    updateSelectedProgram(newProgram);
    try {
      /*Loading last workout of the selected program on "Log New Workout"
      to ease the new input for the user.*/
      //May be rewrited to choose a training based on reps scheme
      //omitting date, reps and rest

      updateLoading(true); //loading...
      const response = await fetch(
        `/api/training-data?selected=${newProgram}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        console.log(response.statusText);
        throw new Error(response.statusText);
      }

      //handling the response. headers: table headers, values: corresponding values of the last workout
      const results = await response.json();
      const { headers, values } = results;
      const newWorkout = { ...workout };
      newWorkout.exercises.length = 0;

      //populating workout with the exercises' data and a new id
      headers.map((item, ind) => {
        if (ind === 0) {
          // id
          newWorkout.id = Number(values[0]) + 1; // new id
          console.log("new id: " + newWorkout.id);
        } else if (ind === 1) {
          /* date. Skipping old date 
          let oldDate = new Date(values[1]).toLocaleDateString("fr-ca");
          newWorkout.date = oldDate; */
        } else if (ind === 2) {
          // reps
          //newWorkout.reps = values[2]; skipping old reps
        } else if (ind === 3) {
          // rest
          //newWorkout.rest = values[3]; skipping old rest
        } else {
          let ex = new exercise(item, values[ind]);
          newWorkout.exercises.push(ex);
        }
      });

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
    //handling date input
    const newRest = event.target.value;
    let newW = { ...workout };

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newRest), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? (newW.rest = newRest)
      : updateError(inputCheck.message);

    newRest == "" && updateError("Rest is empty");

    if (inputCheck.intInRange) {
      restRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3`;
    }

    updateWorkout(newW);
  };

  const handleRestBlur = (event) => {
    const newRest = event.target.value;
    let newW = { ...workout };

    updateError(false);

    let inputCheck = checkIntegerRange(Number(newRest), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? (newW.rest = newRest)
      : updateError(inputCheck.message);

    newRest == "" && updateError("Rest is empty");

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
    <div name="settings" className="w-full">
      <div className="flex flex-row ">
        <div className={tagStyle}>Program</div>
        <select
          type="text"
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
        <div className={tagStyle}>Date</div>
        <input
          type="date"
          max={maxDate}
          onChange={handleDate}
          onBlur={handleDateBlur}
          value={workout.date}
          className={`${buttonStyle} bg-sky-700 hover:bg-sky-900 w-2/3 `}
          ref={dateRef}
        />
      </div>
      <div className="flex flex-row">
        <div className={`${tagStyle}`}>Reps</div>
        <div className="flex flex-row justify-between w-2/3 m-1">
          <input
            className={`${smButtonStyle} bg-sky-700 hover:bg-sky-900 mr-1`}
            type="number"
            value={setRep[0]}
            onChange={handleSets}
            onBlur={handleSetsBlur}
            ref={setsRef}
          />
          <input
            className={`${smButtonStyle} bg-sky-700 hover:bg-sky-900 ml-1`}
            type="number"
            value={setRep[1]}
            onChange={handleReps}
            onBlur={handleRepsBlur}
            ref={repsRef}
          />
        </div>
      </div>
      <div className="flex flex-row">
        <div className={tagStyle}>Rest (sec)</div>
        <input
          type="number"
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
