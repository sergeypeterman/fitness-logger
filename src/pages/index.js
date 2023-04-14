import { Fragment, useState } from "react";

function Settings({ workout, updateWorkout, isActive }) {
  // component for setting the date and reps, input is disabled when it's used inside a new workout

  const handleDate = (event) => {
    //handling date input
    const newDate = event.target.value;
    let newW = { ...workout };

    newW.date = newDate;
    updateWorkout(newW);
  };

  const handleReps = (event) => {
    //handling reps part of Reps input
    let newW = { ...workout };
    let newReps = event.target.value;
    let newRepsArr = newW.reps.split("x");

    newRepsArr[1] = newReps;

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const handleSets = (event) => {
    //handling sets part of Reps input
    let newW = { ...workout };
    let newSets = event.target.value;
    let newRepsArr = newW.reps.split("x");

    newRepsArr[0] = newSets;

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const setRep = workout.reps.split("x"); //extracting sets and reps to an array
  const buttonStyle = isActive
    ? "text-center px-5 py-3 m-1 text-black rounded-lg text-lg bg-gray-300"
    : BUTTONSTYLE;
  const tagStyle = isActive
    ? "bg-gray-300 w-36 text-center px-5 py-3 m-1 text-black rounded-lg font-display text-lg"
    : TAGSTYLE;

  const handleRest = (event) => {
    //handling date input
    const newRest = event.target.value;
    let newW = { ...workout };

    newW.rest = newRest;
    updateWorkout(newW);
  };

  return (
    <div>
      <div className="flex flex-row">
        <div className={tagStyle}>Date</div>
        <input
          type="date"
          onChange={handleDate}
          value={workout.date}
          className={`${buttonStyle} w-52 `}
          disabled={isActive}
        />
      </div>
      <div className="flex flex-row">
        <div className={`${tagStyle} mr-2`}>Reps</div>
        <div className="flex flex-row justify-between w-52">
          <input
            className={`${buttonStyle}  w-1/2 ml-0`}
            type="number"
            value={setRep[0]}
            onChange={handleSets}
            disabled={isActive}
          />
          <input
            className={`${buttonStyle}  w-1/2 mr-0`}
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
          className={`${buttonStyle} w-52 `}
          disabled={isActive}
        />
      </div>
    </div>
  );
}

//////////////////////***************************************/
function exercise(name, workload) {
  this.name = name;
  this.workload = workload;
}

class trainingRecord {
  constructor(id, date, reps, rest, exercises = []) {
    this.id = id;
    this.date = date;
    this.reps = reps;
    this.rest = rest;
    this.exercises = exercises;
  }
}

const TAGSTYLE =
  "bg-sky-300 w-36 text-center px-5 py-3 m-1 text-black rounded-lg font-display text-lg";
const BUTTONSTYLE =
  "bg-sky-700 hover:bg-sky-900 text-center px-5 py-3 m-1 text-white rounded-lg text-lg";

const today = new Date().toLocaleDateString("fr-ca");
const initialWorkout = new trainingRecord(-1, today, "2x15", 120, []);
//////////////////////***************************************/

export default function Home() {
  const [error, setError] = useState(false);
  const [workout, setWorkout] = useState(initialWorkout);
  const [fetched, setFetched] = useState(false); // is the first button pressed

  const updateWorkout = (wout) => {
    setWorkout(wout);
    console.log("worked " + workout.date);
  };

  const resetWorkout = () => {
    const blank = { ...initialWorkout };
    blank.exercises.length = 0; //reset exercises
    setWorkout(blank);
  };

  const handleClick = async () => {
    try {
      const response = await fetch(`/api/training-data`, {
        method: "GET",
      });
      if (!response.ok) {
        console.log(response.statusText);
        throw new Error(response.statusText);
      }

      const results = await response.json();
      const { headers, values } = results;
      const newWorkout = { ...workout };

      console.log(`current workout obj:`);
      console.log(workout);
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

      setWorkout(newWorkout);
      setFetched(true);
    } catch (err) {
      console.log("error.message handleclick: "+ err.message);
      setError({
        error: true,
        message: err.message,
      });
    }
  };

  const handlePost = async () => {
    const newValues = [];

    for (let ind = 0; ind < workout.exercises.length + 4; ind++) {
      let item;
      if (ind === 0) {
        // id
        item = workout.id;
      } else if (ind === 1) {
        //date
        item = workout.date;
      } else if (ind === 2) {
        // reps
        item = workout.reps;
      } else if (ind === 3) {
        // rest
        item = workout.rest;
      } else {
        //exercises
        item = workout.exercises[ind - 4].workload;
      }
      newValues.push(item);
    }

    try {
      const response = await fetch(`/api/training-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newValues),
      });

      if (!response.ok) {
        console.log(response.statusText);
        throw new Error(response.statusText);
      }

      setFetched(false); //reset fetch status
      resetWorkout(); //reset workout state
    } catch (err) {
      console.log("error.message");
      setError({
        error: true,
        message: err.message,
      });
    }
  };

  const handleExercise = (index, event) => {
    let newW = { ...workout };
    let newLoad = event.target.value;

    newW.exercises[index].workload = newLoad;
    setWorkout(newW);
  };

  return (
    <main className="h-screen overflow-hidden flex flex-col items-center justify-center w-full">
      <div className="shadow-xl flex flex-col items-center p-5 justify-center border-slate-400 border-2 rounded-2xl border-solid">
        <div className="font-header text-5xl pb-5 ">Fitness logger</div>
        <Settings
          workout={workout}
          updateWorkout={updateWorkout}
          isActive={fetched}
        />
        {fetched ? (
          <Fragment>
            {workout.exercises.map((item, ind) => {
              return (
                <div className="flex flex-row" key={ind}>
                  <div className={TAGSTYLE}>{item.name}</div>
                  <input
                    type="number"
                    value={item.workload}
                    className={`${BUTTONSTYLE}  w-32 mr-0`}
                    onChange={(e) => handleExercise(ind, e)}
                  />
                </div>
              );
            })}
            <button
              className={`${BUTTONSTYLE} mt-3 mx-0 w-auto shadow-md active:shadow-none`}
              onClick={() => handlePost()}
            >
              Add new Workout
            </button>
          </Fragment>
        ) : (
          <Fragment>
            <button
              className={`${BUTTONSTYLE} mt-3 mx-0 w-auto shadow-md active:shadow-none`}
              onClick={() => handleClick()}
            >
              Log New Workout
            </button>
          </Fragment>
        )}

        {error ? <div>{error.message}</div> : null}
      </div>
    </main>
  );
}
