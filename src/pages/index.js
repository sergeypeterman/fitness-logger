import { Fragment, useEffect, useState } from "react";
import { Settings } from "../components/settings";
import {
  exercise,
  trainingRecord,
  TAGSTYLE,
  BUTTONSTYLE,
} from "../components/constants";
import { Button } from "@/components/button.js";

//////////////////////***************************************/
const today = new Date().toLocaleDateString("fr-ca");
const initialWorkout = new trainingRecord(-1, today, "2x15", 120, []);

//////////////////////***************************************/

export default function Home() {
  const [error, setError] = useState(false);
  const [workout, setWorkout] = useState(initialWorkout);
  const [fetched, setFetched] = useState(false); // is the first button pressed
  const [isLoading, setLoading] = useState(false);
  const [program, setProgram] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    const initial = Buffer.from("initial").toString("base64");
    const test = Buffer.from(initial, "base64").toString("ascii");
    console.log(`${initial} encoded from ${test}`);

    const response = fetch(`/api/training-data?selected=${initial}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        const { titles } = data;
        setProgram(titles);
        setSelectedProgram(titles[0]);
        console.log(titles[0]);
      })
      .catch((error) => {
        console.error(error);
        setError({
          error: true,
          message: error.message,
        });
      });
  }, []);

  const updateError = (err) => {
    err ? setError({error:true, message:err}): setError(err);
  }

  const updateWorkout = (wout) => {
    setWorkout(wout);
  };

  const updateProgram = (prg) => {
    setSelectedProgram(prg);
  };

  const resetWorkout = () => {
    const blank = { ...initialWorkout };
    blank.exercises.length = 0; //reset exercises
    setWorkout(blank);
  };

  const handleClick = async () => {
    try {
      /*Loading last workout of the selected program on "Log New Workout"
      to ease the new input for the user.*/
      //May be rewrited to choose a training based on reps scheme
      //omitting date, reps and rest

      setLoading(true); //loading...

      const response = await fetch(
        `/api/training-data?selected=${selectedProgram}`,
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
      setWorkout(newWorkout);
      setFetched(true);
      setLoading(false);
    } catch (err) {
      console.log("error.message handleclick: " + err.message);
      setError({
        error: true,
        message: err.message,
      });
    }
  };

  const handlePost = async () => {
    //handling posting the data to the api

    setLoading(true); //loading...
    //formatting workout to an array so it will be posted to the api
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
      const response = await fetch(
        `/api/training-data?selected=${selectedProgram}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newValues),
        }
      );

      if (!response.ok) {
        console.log(response.statusText);
        throw new Error(response.statusText);
      }

      setLoading(false); //loading done
      setFetched(false); //reset fetch status
      resetWorkout(); //reset workout' state
    } catch (err) {
      console.log("error.message");
      setError({
        error: true,
        message: err.message,
      });
    }
  };

  const handleExercise = (index, event) => {
    //handling workload changes in the exercises screen items-center justify-center

    let newW = { ...workout };
    let newLoad = event.target.value;

    newW.exercises[index].workload = newLoad;
    setWorkout(newW);
  };

  return (
    <main className="h-screen relative overflow-auto flex flex-col m-auto w-full ">
      <div
        name="widget"
        className="max-w-lg min-w-sm shadow-xl flex flex-col p-5 m-auto border-slate-400 border-2 rounded-2xl border-solid"
      >
        <div name="logo" className="font-header text-5xl pb-5 m-auto ">
          FITNESS LOGGER
        </div>
        <Settings
          workout={workout}
          updateWorkout={updateWorkout}
          isActive={fetched}
          program={program}
          selectedProgram={selectedProgram}
          updateProgram={updateProgram}
          isLoading={isLoading}
          updateLoading={setLoading}
          error={error}
          updateError={updateError}
        />
        {fetched ? ( //if the data is fetched, render exercises screen
          <Fragment>
            {workout.exercises.map((item, ind) => {
              return (
                <div
                  name="exercises"
                  className="flex flex-row w-full "
                  key={ind}
                >
                  <div className={`${TAGSTYLE} w-2/3 `}>{item.name}</div>
                  <input
                    name={`exercise-${ind}`}
                    type="number"
                    value={item.workload}
                    className={`${BUTTONSTYLE}  w-1/3`}
                    onChange={(e) => handleExercise(ind, e)}
                  />
                </div>
              );
            })}
            <div className="flex w-full justify-between">
              <button
                name="back"
                className={`${BUTTONSTYLE} mt-3 shadow-md active:shadow-none`}
                onClick={() => {
                  setFetched(false);
                  resetWorkout();
                }}
              >
                Back
              </button>
              <Button
                buttonCaption={"Add new Workout"}
                isLoading={isLoading}
                onClickHandler={handlePost}
                loadingCaption={"Uploading Workout"}
              />
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <Button
              buttonCaption={"Log New Workout"}
              isLoading={isLoading}
              onClickHandler={handleClick}
              loadingCaption={"Retrieving Last Workout"}
            />
          </Fragment>
        )}

        {error ? <div>{error.message}</div> : null}
      </div>
    </main>
  );
}

/*<button
              name="new-workout"
              className={`${BUTTONSTYLE} mt-3 mx-0 w-auto shadow-md active:shadow-none`}
              onClick={() => handleClick()}
            >
              Log New Workout
            </button>
            
                        <button
              name="post-workout"
              className={`${BUTTONSTYLE} mt-3 mx-0 w-auto shadow-md active:shadow-none`}
              onClick={() => handlePost()}
            >
              Add new Workout
            </button>*/
