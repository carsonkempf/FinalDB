document.addEventListener('DOMContentLoaded', function() {
    // Get workout ID from the URL on page load
    const workoutId = getWorkoutIdFromUrl();

    // Fetch and display exercises for this workout
    fetchExercises(workoutId);

    // Setup listener for the "done" button to redirect to the edit workout page
    const doneButton = document.getElementById('done-button');
    doneButton.addEventListener('click', function() {
        window.location.href = `/add-or-edit-workout/${workoutId}`;
    });
});

// Extract the workout ID from the current page URL
function getWorkoutIdFromUrl() {
    const urlParts = window.location.pathname.split('/');
    return urlParts[urlParts.length - 1];
}

// Fetch exercises associated with the workout ID and display them
function fetchExercises(workoutId) {
    fetch(`/api/exercises-in-workouts/${workoutId}`)
        .then(response => response.json())
        .then(exercises => displayExercises(exercises, workoutId))
        .catch(error => console.error('Failed to fetch exercises:', error));
}

// Display each exercise with a checkbox to mark if it is included in the workout
function displayExercises(exercises, workoutId) {
    const container = document.getElementById('exercises-container');
    container.innerHTML = ''; // Clear any existing content

    exercises.forEach(exercise => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-item';

        // Checkbox to select or deselect an exercise
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = exercise.isAdded; // Assume `isAdded` attribute shows whether the exercise is in the workout
        checkbox.addEventListener('change', () => handleCheckboxChange(workoutId, exercise.id, checkbox.checked));

        // Label for the checkbox
        const label = document.createElement('label');
        label.textContent = `${exercise.name} - ${exercise.description}`;
        label.prepend(checkbox);

        exerciseDiv.appendChild(label);
        container.appendChild(exerciseDiv);
    });
}

// Handle changes in checkbox state, either adding or removing the exercise from the workout
function handleCheckboxChange(workoutId, exerciseId, isChecked) {
    const action = isChecked ? 'add' : 'remove';
    const url = `/api/exercise-to-workout/${action}/${workoutId}/${exerciseId}`;

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workout_id: workoutId, exercise_id: exerciseId })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    })
    .catch(error => console.error('Error processing request:', error));
}
