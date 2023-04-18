import { exercise, trainingRecord, TAGSTYLE, BUTTONSTYLE } from "./constants";

export function Exercises({ workout, updateWorkout }) {
  const handleExercise = (index, event) => {
    //handling workload changes in the exercises screen items-center justify-center

    let newW = { ...workout };
    let newLoad = event.target.value;

    newW.exercises[index].workload = newLoad;
    updateWorkout(newW);
  };

  return (
    <div>
      {workout.exercises.map((item, ind) => {
        return (
          <div name="exercises" className="flex flex-row w-full " key={ind}>
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
    </div>
  );
}
