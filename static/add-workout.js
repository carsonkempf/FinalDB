document.addEventListener('DOMContentLoaded', function() {
    let workoutId = getWorkoutIdFromUrl();
    if (!workoutId) {
        generateWorkoutId().then(newId => {
            workoutId = newId;
            updateUrlWithWorkoutId(workoutId);
            initializePage(workoutId);
        });
    } else {
        // Remove any additional workout ID parameters from the URL
        removeExtraWorkoutIdFromUrl();
        initializePage(workoutId);
    }
});

function initializePage(workoutId) {
    setupEventListeners(workoutId);
    fetchExercisesWithWorkout(workoutId);
}

function setupEventListeners(workoutId) {
    const form = document.getElementById('workout-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        submitWorkoutForm(workoutId);
    });

    const selectExerciseButton = document.getElementById('select-exercise-button');
    if (selectExerciseButton) {
        selectExerciseButton.addEventListener('click', function() {
            const selectedExerciseId = document.getElementById('selected-exercise-id').value;
            joinExerciseToWorkout(selectedExerciseId, workoutId);
        });
    }
}

function fetchExercisesWithWorkout(workoutId) {
    Promise.all([
        fetch(`/api/exercises-with-workouts/${workoutId}`).then(response => response.json()),
        fetch(`/api/joined-exercises/${workoutId}`).then(response => response.json())
    ])
    .then(([directExercises, joinedExercises]) => displayExercises([...directExercises, ...joinedExercises]))
    .catch(error => console.error('Error fetching exercises:', error));
}

function displayExercises(exercises) {
    const container = document.getElementById('exercises-container');
    container.innerHTML = '';  // Clear previous content
    const ul = document.createElement('ul');
    exercises.forEach(exercise => {
        const li = document.createElement('li');
        li.textContent = `${exercise.exercise_name} (Workout: ${exercise.workout_name})`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

function joinExerciseToWorkout(exerciseId, workoutId) {
    fetch(`/api/exercise-to-workout/add/${workoutId}/${exerciseId}`, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchExercisesWithWorkout(workoutId);
        } else {
            alert('Error adding exercise to workout: ' + data.message);
        }
    })
    .catch(error => alert('Error joining exercise to workout: ' + error));
}

function removeExerciseFromWorkout(exerciseId, workoutId) {
    fetch(`/api/exercise-to-workout/remove/${workoutId}/${exerciseId}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchExercisesWithWorkout(workoutId);
        } else {
            alert('Error removing exercise from workout: ' + data.message);
        }
    })
    .catch(error => alert('Error removing exercise from workout: ' + error));
}

function submitWorkoutForm(workoutId) {
    const formData = new FormData(document.getElementById('workout-form'));
    const actionUrl = `/insert-workout/${workoutId}`; // New route for insertion

    fetch(actionUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/workout-list'; // Redirect to workout list on success
        } else {
            alert('Error creating or updating workout: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Failed to submit workout:', error);
        alert('Failed to submit workout.');
    });
}

function generateWorkoutId() {
    return fetch('/api/generate-workout-id')
        .then(response => response.json())
        .then(data => data.workout_id);
}

function removeExtraWorkoutIdFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('workout_id');
    window.history.replaceState({}, document.title, url.pathname);
}

function updateUrlWithWorkoutId(workoutId) {
    const newUrl = `/add-or-edit-workout/${workoutId}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

function getWorkoutIdFromUrl() {
    const urlParts = window.location.pathname.split('/');
    return urlParts[urlParts.length - 1];
}
