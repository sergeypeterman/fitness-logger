As a frontend developer with a passion for fitness, I have created a pet-project on GitHub using Next.js and React to simplify the process of tracking my workouts. The project employs Google Sheets as a database and includes a straightforward interface that allows me to select a pre-designed fitness program from a Google Sheet and enter specific details for each exercise, including sets, repetitions, and rest periods. 

The application has unit tests that cover some but not all of its functionality. These tests were written using the Jest testing framework. 

The app is available here:
http://fitnesslogger.sergeypeterman.com/

To ensure the security of my Google API keys, I have utilized Next.js's serverless function and encryption capabilities. The project makes it easy for me to retrieve a list of exercises from the sheet and input my workout data, with the option to upload it to the sheet after completion.

The user begins by opening the page and completing the form by selecting a workout program, providing a date, and defining the volume and rest period. Then, the workload must be filled out for each exercise. To assist the user in filling out the numbers, the application presents data from the last workout submitted to the database (Google Sheet). The app dynamically reads the workout programs and exercises lists from the worksheet names and the header row, respectively, of the Google sheet provided.

When the user enters data in the application, it is validated for correctness in real-time on the client side. If any of the fields contain incorrect data, the field will be highlighted in red and an error message will be displayed. The user will not be able to proceed until they provide the correct input. Once the data is correct, it can be submitted by clicking the "Add new Workout" button.

![fillingout](https://user-images.githubusercontent.com/112394347/233692987-d733d15f-8e03-485a-951e-10258d0f865d.gif)

After the data is submitted, it is verified again by a serverless function. The function checks the data for correctness after the API call but before the data is uploaded to the spreadsheet. This ensures that only valid data is stored in the spreadsheet.

If the data is deemed valid, a new row is created to represent the new logged workout.

![submit](https://user-images.githubusercontent.com/112394347/233693111-c2beae27-90a4-4fb1-9340-6efdef491702.gif)

↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

![addrow](https://user-images.githubusercontent.com/112394347/233693123-23bdf15f-8cbd-4e88-9c19-406fe589d84a.gif)

While this project was developed for my personal use, it serves as a compelling demonstration of my capacity to effectively use popular frontend technologies to create practical applications. I am eager to bring my skills and enthusiasm to your IT team and continue honing my abilities as a frontend developer.
