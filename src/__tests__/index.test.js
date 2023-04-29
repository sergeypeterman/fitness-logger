/**
 * @jest-environment jsdom
 */

import renderer from "react-test-renderer";
import Home from "@/pages";
import {
  act,
  waitForElement,
  screen,
  render,
  cleanup,
} from "@testing-library/react";
import { exercise } from "@/components/constants";
import "@testing-library/jest-dom";

const sheetTitles = ["Break-In Squat", "Break-In Deadlift"];
const values = ["39", "4/26/2023", "2x15", "120", "223", "77", "50", "10", "0"];
const headers = [
  "id",
  "Date",
  "Reps",
  "Rest (sec)",
  "Squat",
  "Static lunge",
  "Dumbbell row",
  "Barbell press",
  "Running",
];

global.fetch = jest.fn((url) => {
  let params = new URLSearchParams(url); //reading fetch url
  const [key] = params.entries(); //reading key from url [address, key]
  const isInitial = Buffer.from("initial").toString("base64");

  if (key[1] === isInitial) {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          titles: sheetTitles,
        }),
    });
  } else {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          headers: headers,
          values: values,
        }),
    });
  }
});

describe("FitnessLogger", () => {
  it("renders Home labels correctly", async () => {
    await act(async () => render(<Home />));

    //const exercise0 = screen.getByRole("spinbutton",{name:headers[5], exact: false});
    for (let i = 1; i < headers.length; i++) {
      const item = headers[i];
      const currentField = screen.getAllByLabelText(item, { exact: false });
      expect(currentField[0]).toBeInTheDocument();
    }
  });
  it("renders Home exercises correctly", async () => {
    await act(async () => render(<Home />));

    //first four are not from the api response
    for (let i = 4; i < values.length; i++) {
      const item = values[i];
      const currentField = screen.getAllByDisplayValue(item, { exact: false });
      expect(currentField[0]).toBeInTheDocument();
    }
  });
});
