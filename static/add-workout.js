document.addEventListener('DOMContentLoaded', function() {
    const selectExerciseBtn = document.getElementById('select-exercise-btn');
    const addWorkoutBtn = document.getElementById('add-workout-btn');

    if (selectExerciseBtn) {
        selectExerciseBtn.addEventListener('click', function() {
            redirectToSelectExercise();
        });
    } else {
        console.error('Select exercise button not found.');
    }

    if (addWorkoutBtn) {
        addWorkoutBtn.addEventListener('click', function() {
            redirectToAddWorkout();
        });
    } else {
        console.error('Add workout button not found.');
    }
});

function redirectToSelectExercise() {
    const workoutId = getWorkoutIdFromUrl();

    if (workoutId) {
        window.location.href = `/select-exercise.html?workout_id=${workoutId}`;
    } else {
        console.error('Workout ID not found in URL.');
    }
}

function redirectToAddWorkout() {
    window.location.href = '/add-workout.html';
}

function getWorkoutIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('workout_id');
}
