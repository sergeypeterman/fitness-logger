import { useEffect, useRef, useState } from "react";
import { exercise, trainingRecord, TAGSTYLE, BUTTONSTYLE } from "./constants";
import { checkIntegerRange } from "./functions";

export function Exercises({ workout, updateWorkout, updateError, error }) {
  const handleExercise = (index, load) => {
    //handling workload changes in the exercises screen items-center justify-center

    let newW = { ...workout };
    let newLoad = load;

    newW.exercises[index].workload = newLoad;

    updateWorkout(newW);
  };

  return (
    <div>
      {workout.exercises.map((item, ind) => {
        return (
          <div name="exercises" className="flex flex-row w-full " key={ind}>
            <div className={`${TAGSTYLE} w-2/3 `}>{item.name}</div>
            <ExerciseValue
              key={`exercise-${ind}-${item.name}`}
              ind={ind}
              workload={item.workload}
              handleExercise={handleExercise}
              name={item.name}
              updateError={updateError}
              error={error}
            />
          </div>
        );
      })}
    </div>
  );
}

function ExerciseValue({
  ind,
  workload,
  handleExercise,
  name,
  updateError,
  error,
}) {
  const [exerciseValue, setExerciseValue] = useState(workload);

  //useEffect(setExerciseValue(workload),[workload]);

  const exRef = useRef();
  const buttonStyle = "text-center px-5 py-3 m-1 text-white rounded-lg text-lg";

  const handleExerciseValue = (event) => {
    const num = event.target.value;

    updateError(false);

    let inputCheck = checkIntegerRange(Number(num), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? setExerciseValue(num)
      : updateError(inputCheck.message);

    num == "" && updateError(`${name} is empty`);

    if (inputCheck.intInRange) {
      exRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-1/3`;
    }

    //setExerciseValue(num);
    handleExercise(ind, num);
  };

  const handleExerciseBlur = (event) => {
    const num = event.target.value;

    updateError(false);

    let inputCheck = checkIntegerRange(Number(num), 0, 999); //check if input is correct
    inputCheck.intInRange
      ? setExerciseValue(num)
      : updateError(inputCheck.message);

    num == "" && updateError(`${name} is empty`);

    if (!inputCheck.intInRange || num === "") {
      exRef.current.className = `${buttonStyle} bg-rose-700 hover:bg-rose-900 w-1/3`;
      exRef.current.focus();
    } else {
      exRef.current.className = `${buttonStyle} bg-sky-700 hover:bg-sky-900 w-1/3`;
      setExerciseValue(num);
      handleExercise(ind, num);
    }
  };

  return (
    <input
      name={`exercise-${ind}-${name}`}
      type="number"
      value={exerciseValue}
      className={`${buttonStyle} bg-sky-700 hover:bg-sky-900 w-1/3`}
      onChange={(e) => handleExerciseValue(e)}
      onBlur={(e) => handleExerciseBlur(e)}
      ref={exRef}
    />
  );
}
