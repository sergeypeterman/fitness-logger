As a frontend developer with a passion for fitness, I have created a pet-project on GitHub using Next.js and React to simplify the process of tracking my workouts. The app is deployed and running on Vercel. The project now employs MySQL running at Oracle Cloud as a database instead of Google Sheets. This change has allowed to speed up the app 3x and opened possibilities for more agile logging of my workouts, as well as to easily get a list of latest workouts.

The application has unit tests that cover some but not all of its functionality. These tests were written using the Jest testing framework. 

The app is available here:
http://fitnesslogger.sergeypeterman.com/

To ensure the security of my database credentials, I have utilized Next.js's serverless function and encryption capabilities. The project makes it easy for me to retrieve a list of exercises from the database and input my workout data, with the option to upload it after completion.

The user begins by opening the page and completing the form by selecting a workout program, providing a date, and defining the volume and rest period. Then, the workload must be filled out for each exercise. To assist the user in filling out the numbers, the application presents data from the last workout submitted to the database. The app dynamically reads the workout programs and exercises lists from the database.

When the user enters data in the application, it is validated for correctness in real-time on the client side. If any of the fields contain incorrect data, the field will be highlighted in red and an error message will be displayed. The user will not be able to proceed until they provide the correct input. Once the data is correct, it can be submitted by clicking the "Add new Workout" button.

![fillout](https://user-images.githubusercontent.com/112394347/235788718-40e450f0-6376-4ded-a395-909edf2a939d.gif)

After the data is submitted, it is verified again by a serverless function. The function checks the data for correctness after the API call but before the data is uploaded to the database. This ensures that only valid data is stored.

If the data is deemed valid, a new record is created to represent the new logged workout.

![load](https://user-images.githubusercontent.com/112394347/235788748-a649f29f-dd71-462a-8122-c9b2c1a9c19a.gif)

While this project was developed for my personal use, it serves as a compelling demonstration of my capacity to effectively use popular frontend technologies to create practical applications. The recent migration from Google Sheets to MySQL showcases my ability to adapt and optimize projects based on evolving requirements. I am eager to bring my skills and enthusiasm to your IT team and continue honing my abilities as a frontend developer.
