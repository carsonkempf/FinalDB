document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('workouts-container');

    fetch('/api/workouts')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            const workoutDiv = document.createElement('div');
            workoutDiv.id = `workout-${item.workout_id}`;  // Set an ID for each workout div for easy access
            workoutDiv.className = 'workout';

            const nameHeader = document.createElement('h2');
            nameHeader.textContent = item.name;
            workoutDiv.appendChild(nameHeader);

            const detailsParagraph = document.createElement('p');
            detailsParagraph.textContent = `Description: ${item.description}, Intensity: ${item.intensity}, Focus: ${item.focus}`;
            workoutDiv.appendChild(detailsParagraph);

            if (item.exercises && item.exercises.length > 0) {
                const exercisesHeader = document.createElement('h3');
                exercisesHeader.textContent = 'Selected Exercises:';
                workoutDiv.appendChild(exercisesHeader);

                const exercisesList = document.createElement('ul');
                item.exercises.forEach(exercise => {
                    const exerciseItem = document.createElement('li');
                    exerciseItem.textContent = `${exercise.name} - Intensity: ${exercise.intensity}, Muscle Group: ${exercise.muscle_group}`;
                    exercisesList.appendChild(exerciseItem);
                });
                workoutDiv.appendChild(exercisesList);
            }

            const editButton = createButton('Edit', 'edit-btn');
            editButton.onclick = () => editWorkout(item.workout_id);
            const deleteButton = createButton('Delete', 'delete-btn');
            deleteButton.onclick = () => deleteWorkout(item.workout_id, workoutDiv);
            workoutDiv.appendChild(editButton);
            workoutDiv.appendChild(deleteButton);

            container.appendChild(workoutDiv);
        });
    })
    .catch(error => console.error('Error loading the workouts:', error));
});

function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    return button;
}

function deleteWorkout(workoutId, workoutDiv) {
    fetch(`/api/workouts/${workoutId}`, { method: 'DELETE' })
    .then(response => {
        if (response.ok) {
            console.log('Workout deleted successfully');
            workoutDiv.remove();  // Remove the workout div from the DOM
        }
    })
    .catch(error => console.error('Error deleting workout:', error));
}

function editWorkout(workoutId) {
    // Redirect to edit-workout page if workoutId exists
    if (workoutId) {
        window.location.href = `/edit-workout/${workoutId}`;
    } else {
        // Redirect to add-workout page with a generated workout ID
        fetch('/api/generate-workout-id')
        .then(response => response.json())
        .then(data => {
            const generatedWorkoutId = data.workout_id;
            window.location.href = `/add-or-edit-workout?workout_id=${generatedWorkoutId}`;
        })
        .catch(error => console.error('Error generating workout ID:', error));
    }
}
