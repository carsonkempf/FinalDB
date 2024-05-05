

-- Create Exercise_Detail table with adjusted columns
CREATE TABLE Exercise_Detail (
    exercise_detail_id INTEGER PRIMARY KEY,
    description TEXT,
    equipment_needed TEXT,
    weight INTEGER,
    intensity TEXT CHECK (intensity IN ('Light', 'Moderate', 'Vigorous')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    sets INTEGER,
    reps INTEGER
);

-- Create Exercise table with specific constraints and columns adjusted
CREATE TABLE Exercise (
    exercise_id INTEGER PRIMARY KEY,
    name TEXT,
    exercise_detail_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    intensity TEXT CHECK (intensity IN ('Light', 'Moderate', 'Vigorous')),
    muscle_group TEXT CHECK (muscle_group IN ('Chest', 'Back', 'Shoulders', 'Arms', 'Abdominals', 'Lower Back', 'Hips', 'Thighs', 'Legs', 'Adductors and Abductors')),
    description TEXT,
    FOREIGN KEY (exercise_detail_id) REFERENCES Exercise_Detail(exercise_detail_id)
);

-- Create Workout table with focus constrained to specific values
CREATE TABLE Workout (
    workout_id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    focus TEXT CHECK (focus IN ('Strength Training', 'Cardiovascular Health', 'Weight Loss', 'Flexibility', 'Balance and Coordination', 'Endurance Training', 'High-Intensity Interval Training (HIIT)', 'Muscle Toning', 'Core Strengthening', 'Functional Fitness', 'Rehabilitation and Recovery', 'Sports Specific Training', 'Bodybuilding', 'Circuit Training', 'Mind-Body Wellness')),
    intensity TEXT CHECK (intensity IN ('Light', 'Moderate', 'Vigorous'))
);

-- Create Day table with DATE type for the date column
CREATE TABLE Day (
    day_id INTEGER PRIMARY KEY,
    date DATE,
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
