document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('workouts-container');
    fetchWorkouts();
});

function fetchWorkouts() {
    fetch('/api/workouts')
    .then(response => response.json())
    .then(data => {
        displayWorkouts(data);
    })
    .catch(error => console.error('Error loading the workouts:', error));
}

function displayWorkouts(data) {
    const container = document.getElementById('workouts-container');
    container.innerHTML = ''; // Clear previous contents
    data.forEach(item => {
        const workoutDiv = document.createElement('div');
        workoutDiv.id = `workout-${item.workout_id}`;
        workoutDiv.className = 'workout';

        const nameHeader = document.createElement('h2');
        nameHeader.textContent = item.name;
        workoutDiv.appendChild(nameHeader);

        const detailsParagraph = document.createElement('p');
        detailsParagraph.textContent = `Description: ${item.description}, Intensity: ${item.intensity}, Focus: ${item.focus}`;
        workoutDiv.appendChild(detailsParagraph);

        if (item.exercises.length > 0) {
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

        appendActionButtons(item, workoutDiv);
        container.appendChild(workoutDiv);
    });
}

function appendActionButtons(item, workoutDiv) {
    const editButton = createButton('Edit', 'edit-btn');
    editButton.onclick = () => editWorkout(item.workout_id);
    const deleteButton = createButton('Delete', 'delete-btn');
    deleteButton.onclick = () => deleteWorkout(item.workout_id, workoutDiv);
    workoutDiv.appendChild(editButton);
    workoutDiv.appendChild(deleteButton);
}

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
            workoutDiv.remove();
        }
    })
    .catch(error => console.error('Error deleting workout:', error));
}

function editWorkout(workoutId) {
    if (workoutId) {
        window.location.href = `/edit-workout/${workoutId}`;
    } else {
        console.error('Missing workout ID for editing.');
    }
}

function createOrEditWorkout(formData) {
    fetch(`/add-or-edit-workout/${formData.get('workout_id')}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        handleWorkoutUpdateResponse(data);
    })
    .catch(error => console.error('Error creating or editing workout:', error));
}

function handleWorkoutUpdateResponse(responseData) {
    if (responseData.success) {
        console.log(responseData.message);
        displayWorkouts(responseData.workouts);
    } else {
        console.error('Error updating workout:', responseData.message);
    }
}
