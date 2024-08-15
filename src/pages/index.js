import { Fragment, useEffect, useState } from "react";
import { Settings } from "../components/settings";
import { trainingRecord } from "../components/constants";
import { Button } from "@/components/button.js";
import { Exercises } from "@/components/exercises";
import "@/components/";
import {
  getNewestSelectedWorkoutFromDB,
  PopulateWorkout,
} from "@/components/functions";
import WorkoutsButton from "@/components/workouts-button";
import WorkoutsHistory from "@/components/workout-history";

const today = new Date().toLocaleDateString("fr-ca");

export async function getServerSideProps() {
  const mysql = await import("mysql2/promise");
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEME,
  });

  const readAttempt = await getNewestSelectedWorkoutFromDB(db, null);
  const wout = new trainingRecord(-1, today, "2x15", 120, []);
  const initialWorkout = PopulateWorkout(
    wout,
    readAttempt.data.headers,
    readAttempt.data.values
  );

  db.end();

  return {
    props: {
      programs: readAttempt.allPrograms,
      selProgram: readAttempt.selectedProgram,
      initialWorkout: initialWorkout,
    },
  };
}

export default function Home({ programs, selProgram, initialWorkout }) {
  const [error, setError] = useState(false);
  const [workout, setWorkout] = useState(initialWorkout);
  const [fetched, setFetched] = useState(1); // 0=initial, 1=fetched last, 2=posted
  const [isLoading, setLoading] = useState(false);
  const [program, setProgram] = useState(programs);
  const [selectedProgram, setSelectedProgram] = useState(selProgram);
  const [showHistory, setShowHistory] = useState(false);

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
        item = workout.exercises[ind - 4];
      }
      newValues.push(item);
    }

    try {
      const response = await fetch(
        `/api/workouts-db?selected=${selectedProgram}`,
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
    <main className="h-screen relative flex flex-col m-auto w-full">
      <div className="static">
        <p
          className={
            !error && fetched === 2
              ? "transition duration-3000 ease-in-out m-auto py-3 w-1/2 flex fixed top-10 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 justify-center items-center bg-green-600 text-white rounded-md"
              : "transition duration-100 ease-in-out opacity-0 m-auto py-3 w-1/2 flex fixed top-10 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 justify-center items-center bg-green-600 text-white rounded-md"
          }
        >
          {!error && fetched === 2 ? "Logged successfully" : null}
        </p>
      </div>
      <div className="h-auto  max-h-full max-w-lg min-w-[353px] md:min-w-[512px] flex flex-col m-auto w-full p-5 border-slate-400 border-2 rounded-2xl border-solid shadow-xl flex flex-col ">
        <div id="widget" className="overflow-auto flex flex-col no-scrollbar ">
          <WorkoutsHistory
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            fetched={fetched}
          />
          <div className={`${!showHistory ? null : "hidden"} flex flex-col`}>
            <div id="logo" className="font-header text-5xl m-auto ">
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
              <div className="flex w-full justify-center">
                <WorkoutsButton
                  className="flex w-1/2"
                  showHistory={showHistory}
                  setShowHistory={setShowHistory}
                />
                <Button
                  className="flex w-1/2"
                  buttonCaption={
                    error ? <div>{String(error.message)}</div> : "Add new"
                  }
                  isLoading={isLoading}
                  onClickHandler={handlePost}
                  loadingCaption={
                    error ? <div>{String(error.message)}</div> : "Loading"
                  }
                  error={error}
                  isFetched={fetched}
                  buttonId="submit"
                />
              </div>
            </Fragment>
          </div>
        </div>
      </div>
    </main>
  );
}
