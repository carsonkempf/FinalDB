// Function to fetch exercises associated with the current workout
function fetchExercisesWithWorkout(workoutId) {
    // Fetch directly associated exercises and joined exercises
    Promise.all([
        fetch(`/api/exercises-with-workouts/${workoutId}`).then(response => response.json()),
        fetch(`/api/joined-exercises/${workoutId}`).then(response => response.json())
    ])
    .then(([directExercises, joinedExercises]) => {
        const allExercises = [...directExercises, ...joinedExercises];
        displayExercises(allExercises);
    })
    .catch(error => console.error('Error fetching exercises:', error));
}

// Function to fetch existing Exercise in Workout tuples
function fetchExistingExerciseInWorkout(exerciseId, workoutId) {
    fetch(`/api/exercise-to-workout/${exerciseId}/${workoutId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayExistingExerciseInWorkout(data.exercise_in_workout);
        } else {
            console.error('Error fetching existing Exercise in Workout tuples:', data.message);
        }
    })
    .catch(error => console.error('Error fetching existing Exercise in Workout tuples:', error));
}

function displayExistingExerciseInWorkout(exerciseInWorkout) {
    const container = document.getElementById('existing-exercise-container');
    if (!container) {
        console.error('Existing exercise container not found.');
        return;
    }

    // Clear previous contents
    container.innerHTML = '';

    // Create a list to display existing Exercise in Workout tuples
    const ul = document.createElement('ul');
    exerciseInWorkout.forEach(exercise => {
        const li = document.createElement('li');
        li.textContent = `${exercise.exercise_name} (Workout: ${exercise.workout_name})`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

// Function to display exercises in the exercises container
function displayExercises(exercises) {
    const container = document.getElementById('exercises-container');
    if (!container) {
        console.error('Exercises container not found.');
        return;
    }

    // Clear previous contents
    container.innerHTML = '';

    // Create a list to display exercises
    const ul = document.createElement('ul');
    exercises.forEach(exercise => {
        const li = document.createElement('li');
        li.textContent = `${exercise.exercise_name} (Workout: ${exercise.workout_name})`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

// Function to handle joining an exercise to the current workout
function joinExerciseToWorkout(exerciseId, workoutId) {
    fetch(`/api/exercise-to-workout/${exerciseId}/${workoutId}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If the exercise was successfully joined, fetch and display updated exercises
            fetchExercisesWithWorkout(workoutId);
        } else {
            console.error('Error joining exercise to workout:', data.message);
        }
    })
    .catch(error => console.error('Error joining exercise to workout:', error));
}

// Function to handle removing an exercise from the current workout
function removeExerciseFromWorkout(exerciseId, workoutId) {
    fetch(`/api/exercise-to-workout/${exerciseId}/${workoutId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If the exercise was successfully removed, fetch and display updated exercises
            fetchExercisesWithWorkout(workoutId);
        } else {
            console.error('Error removing exercise from workout:', data.message);
        }
    })
    .catch(error => console.error('Error removing exercise from workout:', error));
}


// Function to redirect to the select exercise page
function redirectToSelectExercise(workoutId) {
    if (workoutId) {
        window.location.href = `/select-exercise/${workoutId}`;
    } else {
        console.error('Workout ID not found in URL.');
    }
}

// Function to redirect to the add workout page
function redirectToAddWorkout(workoutId) {
    window.location.href = `/add-workout.html?workout_id=${workoutId}`;
}

// Function to extract workout ID from the URL
function getWorkoutIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('workout_id');
}

// Event listener when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    const workoutId = getWorkoutIdFromUrl();
    if (workoutId) {
        fetchExercisesWithWorkout(workoutId);
    } else {
        console.error('Workout ID not found in URL.');
    }
});

// Event listener for selecting an exercise
document.getElementById('select-exercise-button').addEventListener('click', function() {
    const selectedExerciseId = document.getElementById('selected-exercise-id').value;
    const workoutId = getWorkoutIdFromUrl();
    if (selectedExerciseId && workoutId) {
        joinExerciseToWorkout(selectedExerciseId, workoutId);
    } else {
        console.error('Selected exercise ID or workout ID not found.');
    }
});
