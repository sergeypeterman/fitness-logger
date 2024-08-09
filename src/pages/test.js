import { BUTTONSTYLE, exercise, trainingRecord } from "@/components/constants";
import { useState } from "react";

export default function Home() {
  const [testString, setTestString] = useState("hello world");
  const apiconnect = async () => {
    try {
      console.log("sent");
      const res = await fetch(
        `/api/workouts-db?workout=${JSON.stringify(testRecord)}`
      );
      const response = await res.json();

      if (response.ok) {
        console.log(`received ${JSON.stringify(response.message)}`);
        setTestString(response.status);
      } else {
        throw new Error(JSON.stringify(response.status));
      }
    } catch (err) {
      setTestString(err.message);
    }
  };
  return (
    <button
      onClick={apiconnect}
      className={`inline-flex items-center justify-center ${BUTTONSTYLE} mt-3 mx-0 w-full shadow-md active:shadow-none`}
    >
      {testString}
    </button>
  );
}

const testExerciseArray = [
  { name: "Squat", workload: 120 },
  { name: "Static lunge", workload: 60 },
  { name: "Barbell row", workload: 65 },
  { name: "Barbell press", workload: 90 },
  { name: "Running", workload: 5 },
];

let testRecord = new trainingRecord(
  1,
  "8/6/2024",
  "2x5",
  "120",
  testExerciseArray
);

const testWorkout = [
  "27",
  "8/6/2024",
  "2x5",
  "120",
  "120",
  "60",
  "65",
  "90",
  "5",
];
const testHeaders = [
  "id",
  "Date",
  "Reps",
  "Rest (sec)",
  "Squat",
  "Static lunge",
  "Barbell row",
  "Barbell press",
  "Running",
];
const testPrograms = [
  "Strength Squat",
  "Strength Deadlift",
  "Break-In Squat",
  "Break-In Deadlift",
];
