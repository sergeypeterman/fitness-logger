import { BUTTONSTYLE } from "./constants";

export default function WorkoutsButton({ showHistory, setShowHistory }) {
  const showWorkouts = () => {
    const status = true;
    setShowHistory(status);
  };
  return (
    <button
      name="show-workouts"
      type="button"
      onClick={showWorkouts}
      className={`inline-flex items-center justify-center ${BUTTONSTYLE} mt-3 w-full shadow-md active:shadow-none`}
    >
      Last Workouts
    </button>
  );
}
