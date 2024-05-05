document.addEventListener('DOMContentLoaded', function() {
    const workoutId = getWorkoutIdFromUrl();
    if (workoutId) {
        fetchExercisesWithWorkout(workoutId);
    } else {
        console.error('Workout ID not found in URL.');
    }
});

function fetchExercisesWithWorkout(workoutId) {
    fetch(`/api/exercises-with-workouts/${workoutId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                displayExercises(data);
            } else {
                console.log('No exercises found for this workout.');
                const container = document.getElementById('exercises-container');
                if (container) {
                    container.textContent = 'No exercises linked to this workout.';
                }
            }
        })
        .catch(error => console.error('Error fetching exercises:', error));
}

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
    exercises.forEach(ex => {
        const li = document.createElement('li');
        li.textContent = `${ex.exercise_name} (Workout: ${ex.workout_name})`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

function redirectToSelectExercise() {
    const workoutId = getWorkoutIdFromUrl();
    if (workoutId) {
        window.location.href = `/select-exercise/${workoutId}`;
    } else {
        console.error('Workout ID not found in URL.');
    }
}

function redirectToAddWorkout() {
    const workoutId = getWorkoutIdFromUrl();
    window.location.href = `/add-workout.html?workout_id=${workoutId}`;
}



function getWorkoutIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('workout_id');
}
