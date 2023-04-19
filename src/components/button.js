import { exercise, trainingRecord, TAGSTYLE, BUTTONSTYLE } from "./constants";

export function Button({
  buttonCaption,
  isLoading,
  onClickHandler,
  loadingCaption,
  error,
  isFetched
}) {
  if (isLoading == true || isFetched != 1) {
    return (
      <button
        disabled
        type="button"
        onClick={() => onClickHandler()}
        className={`${BUTTONSTYLE} mt-3 mx-0 w-full shadow-md active:shadow-none`}
      >
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingCaption}
        </div>
      </button>
    );
  } else {
    return (
      <button
        name="new-workout"
        className={`${BUTTONSTYLE} mt-3 mx-1 w-full shadow-md active:shadow-none`}
        onClick={() => onClickHandler()}
        disabled={error}
      >
        {buttonCaption}
      </button>
    );
  }
}
