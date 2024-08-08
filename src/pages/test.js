import { BUTTONSTYLE } from "@/components/constants";
import { useState } from "react";

export default function Home() {
  const [testString, setTestString] = useState("hello world");
  const apiconnect = async () => {
    try {
      console.log("sent");
      const res = await fetch("/api/testdb?str=hi");
      const response = await res.json();

      if (response.ok) {
        console.log(`received ${JSON.stringify(response)}`);
        setTestString(JSON.stringify(response.message));
      } else {
        throw new Error(JSON.stringify(response.message));
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
