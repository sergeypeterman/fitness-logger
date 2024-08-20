import { useEffect, useState } from "react";
import { BUTTONSTYLE, TAGSTYLE } from "./constants";

export default function WorkoutsHistory({ showHistory, setShowHistory,fetched }) {
  const [workoutsHistory, setWorkoutHistory] = useState([]);

  //get last workouts for the list
  useEffect(() => {
    async function getWorkoutList() {
      const res = await fetch(`/api/workouts-db/?requestType=list`, {
        method: "GET",
      });
      const result = await res.json();
      //console.log("result", result);
      setWorkoutHistory(result.workoutHistory);
    }

    getWorkoutList();
  }, [fetched]);
  return (
    <div className={`${showHistory ? "" : "hidden"} flex flex-col p-1 `}>
      <div className="px-2">
        {workoutsHistory.map((item, ind) => {
          return (
            <div
              id={`history-block-${ind}`}
              className={`flex flex-row justify-between w-full ${TAGSTYLE} mx-auto text-base`}
              key={`history-block-${ind}`}
            >
              <p className="px-3">{item["formatted_date"]}</p>
              <p className="px-3">{item.name}</p>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => setShowHistory(false)}
        className={`${BUTTONSTYLE} m-1 w-full sticky bottom-0 mx-auto drop-shadow-sm`}
      >
        Close
      </button>
    </div>
  );
}
