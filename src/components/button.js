import { exercise, trainingRecord, TAGSTYLE, BUTTONSTYLE } from "./constants";

export function Button({
  buttonCaption,
  isLoading,
  onClickHandler,
  loadingCaption,
  error,
  isFetched,
  buttonId,
}) {
  if (isLoading == true || isFetched != 1) {
    return (
      <button
        name={buttonId}
        disabled
        type="button"
        onClick={() => onClickHandler()}
        className={`inline-flex items-center justify-center ${BUTTONSTYLE} mt-3 mx-1 w-full shadow-md active:shadow-none`}
      >
        <svg
          className="animate-spin h-5 w-5 text-white"
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
        
      </button>
    );
  } else {
    return (
      <button
        name={buttonId}
        className={`${BUTTONSTYLE} mt-3 mx-1 w-full shadow-md active:shadow-none`}
        onClick={() => onClickHandler()}
        disabled={error}
      >
        {buttonCaption}
      </button>
    );
  }
}
