-- Drop tables if they exist
DROP TABLE IF EXISTS Workout_On_Day;
DROP TABLE IF EXISTS Exercise_In_Workout;
DROP TABLE IF EXISTS Exercise_With_Detail;
DROP TABLE IF EXISTS Day;
DROP TABLE IF EXISTS Workout;
DROP TABLE IF EXISTS Exercise;
DROP TABLE IF EXISTS Exercise_Detail;

-- Create Exercise_Detail table with additional columns
CREATE TABLE Exercise_Detail (
    exercise_detail_id INTEGER PRIMARY KEY,
    description TEXT,
    equipment_needed TEXT,
    weight TEXT,           -- Additional column
    intensity TEXT,        -- Additional column
    rating INTEGER,        -- Additional column
    sets INTEGER,          -- Additional column
    reps INTEGER           -- Additional column
);

-- Create Exercise table with additional columns
CREATE TABLE Exercise (
    exercise_id INTEGER PRIMARY KEY,
    name TEXT,
    exercise_detail_id INTEGER,
    rating INTEGER,        -- Additional column
    intensity TEXT,        -- Additional column
    muscle_group TEXT,     -- Additional column
    description TEXT,      -- Additional column
    exercise_type TEXT,    -- Additional column
    FOREIGN KEY (exercise_detail_id) REFERENCES Exercise_Detail(exercise_detail_id)
);

-- Create Workout table with additional columns
CREATE TABLE Workout (
    workout_id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    rating INTEGER,        -- Additional column
    focus TEXT,            -- Additional column
    intensity TEXT         -- Additional column
);

-- Create Day table
CREATE TABLE Day (
    day_id INTEGER PRIMARY KEY,
    date TEXT,
    note TEXT
);

-- Create Exercise_With_Detail table
CREATE TABLE Exercise_With_Detail (
    exercise_with_detail_id INTEGER PRIMARY KEY,
    exercise_id INTEGER,
    detail_id INTEGER,
    FOREIGN KEY (exercise_id) REFERENCES Exercise(exercise_id),
    FOREIGN KEY (detail_id) REFERENCES Exercise_Detail(exercise_detail_id)
);

-- Create Exercise_In_Workout table
CREATE TABLE Exercise_In_Workout (
    exercise_in_workout_id INTEGER PRIMARY KEY,
    exercise_id INTEGER,
    workout_id INTEGER,
    FOREIGN KEY (exercise_id) REFERENCES Exercise(exercise_id),
    FOREIGN KEY (workout_id) REFERENCES Workout(workout_id)
);

-- Create Workout_On_Day table
CREATE TABLE Workout_On_Day (
    workout_on_day_id INTEGER PRIMARY KEY,
    workout_id INTEGER,
    day_id INTEGER,
    FOREIGN KEY (workout_id) REFERENCES Workout(workout_id),
    FOREIGN KEY (day_id) REFERENCES Day(day_id)
);
