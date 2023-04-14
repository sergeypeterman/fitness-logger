import { Fragment, useEffect, useState } from "react";

function Settings({ workout, updateWorkout }) {
  // component for setting the date and reps, input is disabled when it's used inside a new workout

  const handleDate = (event) => {
    //handling date input
    const newDate = event.target.value;
    let newW = { ...workout };

    newW.date = newDate;
    updateWorkout(newW);
  };

  const handleReps = (event) => {
    let newW = { ...workout };
    let newReps = event.target.value;
    let newRepsArr = newW.reps.split("x");

    newRepsArr[1] = newReps;

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const handleSets = (event) => {
    let newW = { ...workout };
    let newSets = event.target.value;
    let newRepsArr = newW.reps.split("x");

    newRepsArr[0] = newSets;

    newW.reps = newRepsArr.join("x");

    updateWorkout(newW);
  };

  const setRep = workout.reps.split("x");

  return (
    <div>
      <div className="flex flex-row">
        <div className={TAGSTYLE}>Date</div>
        <input
          type="date"
          onChange={handleDate}
          value={workout.date}
          className={`${BUTTONSTYLE} w-48`}
        />
      </div>
      <div className="flex flex-row">
        <div className={`${TAGSTYLE} mr-2`}>Reps</div>
        <input
          className={`${BUTTONSTYLE} mx-0 w-24`}
          type="number"
          value={setRep[0]}
          onChange={handleSets}
        />
        <input
          className={`${BUTTONSTYLE} mx-0 w-24`}
          type="number"
          value={setRep[1]}
          onChange={handleReps}
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
  constructor(id, date, reps, exercises = []) {
    this.id = id;
    this.date = date;
    this.reps = reps;
    this.exercises = exercises;
  }
}

const TAGSTYLE =
  "bg-sky-300 w-32 text-center px-5 py-3 m-1 text-black rounded-lg";
const BUTTONSTYLE =
  "bg-sky-700 hover:bg-sky-900 w-32 text-center px-5 py-3 m-1 text-white rounded-lg";

const today = new Date().toLocaleDateString("fr-ca");
const initialWorkout = new trainingRecord(-1, today, "2x15", []);
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
    const blank = {...initialWorkout};
    blank.exercises.length = 0; //reset exercises
    setWorkout(blank);
  }

  const handleClick = async () => {
    try {
      const response = await fetch(`/api/training-data`,{
        method: 'GET',
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
        } else {
          let ex = new exercise(item, values[ind]);
          newWorkout.exercises.push(ex);
        }
      });

      setWorkout(newWorkout);
      setFetched(true);
    } catch (err) {
      console.log("error.message handleclick");
      setError({
        error: true,
        message: err.message,
      });
    }
  };

  const handlePost = async () => {
    const newValues = [];

    for(let ind=0; ind<(workout.exercises.length + 3); ind++)
    {
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
      } else {
        //exercises
        item = workout.exercises[ind-3].workload;
      }
      newValues.push(item);
    }

    try {
      const response = await fetch(`/api/training-data`,{
        method: 'POST',
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
      {fetched ? (
        <Fragment>
          <div>{workout.date}</div>
          <div>{workout.reps}</div>
          {workout.exercises.map((item, ind) => {
            return (
              <div className="flex flex-row" key={ind}>
                <div className={TAGSTYLE}>{item.name}</div>
                <input
                  type="number"
                  value={item.workload}
                  className={BUTTONSTYLE}
                  onChange={(e) => handleExercise(ind, e)}
                />
              </div>
            );
          })}
          <button
            className="bg-sky-600 hover:bg-sky-700 px-5 py-3 text-white rounded-lg"
            onClick={() => handlePost()}
          >
            Add new Workout
          </button>
        </Fragment>
      ) : (
        <Fragment>
          <Settings workout={workout} updateWorkout={updateWorkout} />
          <button
            className={`${BUTTONSTYLE} mx-0 w-auto`}
            onClick={() => handleClick()}
          >
            Log New Workout
          </button>
        </Fragment>
      )}

      {error ? <div>{error.message}</div> : null}
    </main>
  );
}
