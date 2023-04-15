import {exercise, trainingRecord, TAGSTYLE, BUTTONSTYLE} from './constants'

export function Settings({ workout, updateWorkout, isActive }) {
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
        <div className={tagStyle}>Program</div>
        <input
          type="date"
          onChange={handleDate}
          value={workout.date}
          className={`${buttonStyle} w-52 `}
          disabled={isActive}
        />
      </div>
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
