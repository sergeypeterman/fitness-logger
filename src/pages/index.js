import { Fragment, useEffect, useState } from "react";
import { Settings } from "../components/settings";
import {
  exercise,
  trainingRecord,
  TAGSTYLE,
  BUTTONSTYLE,
} from "../components/constants";
import { Button } from "@/components/button.js";
import { Exercises } from "@/components/exercises";
import "@/components/";

//////////////////////***************************************/
const today = new Date().toLocaleDateString("fr-ca");
const initialWorkout = new trainingRecord(-1, today, "2x15", 120, []);

//////////////////////***************************************/

export default function Home() {
  const [error, setError] = useState(false);
  const [workout, setWorkout] = useState(initialWorkout);
  const [fetched, setFetched] = useState(0); // 0=initial, 1=fetched last, 2=posted
  const [isLoading, setLoading] = useState(false);
  const [program, setProgram] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    // encoding 'initial' to base64 to prevent confusion in case there is a Program
    //that is called "initial" by the user
    if (fetched === 0) {
      console.log("loading from Home (initial)");
      let resError;

      const initial = Buffer.from("initial").toString("base64");
      setLoading(true);
      fetch(`/api/training-data?selected=${initial}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          const { titles } = data;
          if (titles) {
            setProgram(titles);
            setSelectedProgram(titles[0]);
            console.log(titles);
            setError(false);
          } else {
            console.log(data);
            resError = new String(data);
            setError({
              error: true,
              message: resError,
            });
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
          setError({
            error: true,
            message: error.message,
          });
        });
      setLoading(false);
    }
  }, [fetched]);

  const updateError = (err) => {
    err ? setError({ error: true, message: err }) : setError(err);
  };

  const updateWorkout = (wout) => {
    setWorkout(wout);
  };

  const updateSelectedProgram = (prg) => {
    let newPrg = new String("");
    newPrg = newPrg.concat(prg);
    setSelectedProgram(newPrg);
  };

  const updateFetched = (isFetched) => {
    setFetched(isFetched);
  };

  const resetWorkout = () => {
    const blank = { ...initialWorkout };
    blank.exercises.length = 0; //reset exercises
    setWorkout(blank);
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
        console.log(`index - ${response.statusText}`);
        setError({
          error: true,
          message: response.statusText,
        });
        setFetched(2);
        throw new Error(response.statusText);
      }

      setLoading(false); //loading done
      setFetched(2);
      setError(false);
      resetWorkout(); //reset workout' state
    } catch (err) {
      setFetched(2);
      setLoading(false);
      console.log(error.message);
      console.log(typeof error.message);
      setError({
        error: true,
        message: String(err.message),
      });
    }
  };

  return (
    <main className="h-screen relative overflow-auto flex flex-col m-auto w-full">
      <div className="static">
        <p
          className={
            !error && fetched === 2
              ? "transition duration-1000 ease-in-out m-auto py-3 w-1/2 flex fixed top-10 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 justify-center items-center bg-green-600 text-white rounded-md"
              : "transition duration-100 ease-in-out opacity-0 m-auto py-3 w-1/2 flex fixed top-10 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 justify-center items-center bg-green-600 text-white rounded-md"
          }
        >
          {!error && fetched === 2 ? "Logged successfully" : null}
        </p>
      </div>
      <div
        name="widget"
        className="max-w-lg min-w-sm box-border shadow-xl flex flex-col p-5 m-auto border-slate-400 border-2 rounded-2xl border-solid"
      >
        <div name="logo" className="font-header text-5xl m-auto ">
          FITNESS LOGGER
        </div>
        <div className={error ? null : "invisible"}>
          <p
            className="m-auto h-6 w-3/4 flex justify-center items-center
          border-rose-300 text-rose-600 border-2 rounded-md border-solid"
          >
            {error ? String(error.message) : null}
          </p>
        </div>
        {selectedProgram && (
          <Settings
            workout={workout}
            updateWorkout={updateWorkout}
            program={program}
            selectedProgram={selectedProgram}
            updateSelectedProgram={updateSelectedProgram}
            isLoading={isLoading}
            updateLoading={setLoading}
            updateFetched={updateFetched}
            error={error}
            updateError={updateError}
            resetWorkout={resetWorkout}
            isFetched={fetched}
          />
        )}

        <Fragment>
          <Exercises
            workout={workout}
            updateWorkout={updateWorkout}
            updateError={updateError}
            error={error}
          />
          <div className="flex w-full">
            <Button
              buttonCaption={
                error ? <div>{String(error.message)}</div> : "Add new Workout"
              }
              isLoading={isLoading}
              onClickHandler={handlePost}
              loadingCaption={
                error ? <div>{String(error.message)}</div> : "Loading Workout"
              }
              error={error}
              isFetched={fetched}
              buttonId="submit"
            />
          </div>
        </Fragment>
      </div>
    </main>
  );
}
