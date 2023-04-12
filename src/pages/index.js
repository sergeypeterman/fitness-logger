import { Fragment, useState } from "react";

export default function Home() {
  const [headers, setHeaders] = useState(null);
  const [values, setValues] = useState(null);
  const [error, setError] = useState(false);

  const [fetched, setFetched] = useState(false); // is the get rows button pressed. probably will be deleted

  const handleClick = async () => {
    try {
      const response = await fetch(`/api/training-data`);
      if (!response.ok) {
        console.log(response.statusText);
        throw new Error(response.statusText);
      }

      const results = await response.json();
      console.log(results);
      const { headers, values } = results;
      setHeaders(headers);
      setValues(values);
      setFetched(true);
    } catch (err) {
      console.log("error.message");
      setError({
        error: true,
        message: err.message,
      });
    }
  };

  const handlePost = async () => {

    const newValues = values.map((item, ind) => {
      if (ind === 0) {
        let dt = new Date(Date.parse(item));
        dt.setDate(dt.getDate() + 1);
        item = dt.toDateString().split(" ").slice(1).join(" ");
        console.log(item);
      } else {
        item = Number(item) + 1;
      }
    });

    setValues(newValues);

    try {
      const response = await fetch(`/api/training-data?post=true`);
      if (!response.ok) {
        console.log(response.statusText);
        throw new Error(response.statusText);
      }

      const results = await response.json();
      console.log(results);
      const { headers, values } = results;
      setHeaders(headers);
      setValues(values);
      setFetched(true);
    } catch (err) {
      console.log("error.message");
      setError({
        error: true,
        message: err.message,
      });
    }
  };

  return (
    <main className="h-screen overflow-hidden flex flex-col items-center justify-center w-full">
      <button
        className="bg-sky-600 hover:bg-sky-700 px-5 py-3 text-white rounded-lg"
        onClick={() => handleClick()}
      >
        get rows
      </button>
      {fetched ? (
        <Fragment>
          {headers.map((item, ind) => {
            return (
              <div className="flex flex-row">
                <div className="bg-sky-300 w-32 text-center px-5 py-3 m-1 text-darkgrey rounded-lg">
                  {item}
                </div>
                <button className="bg-sky-700 hover:bg-sky-900 w-32 text-center px-5 py-3 m-1 text-white rounded-lg">
                  {values[ind]}
                </button>
              </div>
            );
          })}
          <button
            className="bg-sky-600 hover:bg-sky-700 px-5 py-3 text-white rounded-lg"
            onClick={() => handlePost()}
          >
            +1 and POST
          </button>
        </Fragment>
      ) : null}

      {error ? <div>{error.message}</div> : null}
    </main>
  );
}
