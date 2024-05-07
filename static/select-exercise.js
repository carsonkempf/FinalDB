document.addEventListener('DOMContentLoaded', function() {
    const workoutId = getWorkoutIdFromUrl();
    fetchExercises(workoutId);

    const doneButton = document.getElementById('done-button');
    doneButton.addEventListener('click', function() {
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/');
        const currentWorkoutId = urlParts[urlParts.length - 1];
        window.location.href = `/add-or-edit-workout/${currentWorkoutId}`;
    });
});


function fetchExercises(workoutId) {
    fetch(`/api/exercises/${workoutId}`)
        .then(response => response.json())
        .then(exercises => displayExercises(exercises, workoutId))
        .catch(error => console.error('Failed to fetch exercises:', error));
}

function displayExercises(exercises, workoutId) {
    const container = document.getElementById('exercises-container');
    exercises.forEach(exercise => {
        const div = document.createElement('div');
        div.innerHTML = `<p>${exercise.name} - ${exercise.description}</p>`;
        const addButton = document.createElement('button');
        addButton.textContent = 'Add to Workout';
        addButton.onclick = () => addExerciseToWorkout(workoutId, exercise.id);
        div.appendChild(addButton);
        container.appendChild(div);
    });
}

function submitExerciseForm(form) {
    const formData = new FormData(form);
    const exerciseId = formData.get('exercise_id');

    fetch(`/update-exercise/${exerciseId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Exercise updated successfully.');
        } else {
            alert('Failed to update exercise.');
        }
    })
    .catch(error => console.error('Error updating exercise:', error));
}



function addExerciseToWorkout(workoutId, exerciseId) {
    fetch('/api/add-exercise-to-workout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({workout_id: workoutId, exercise_id: exerciseId})
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error adding exercise to workout:', error));
}


function createExerciseDetailDisplay(exercise) {
    const displayDiv = document.createElement('div');
    displayDiv.className = 'exercise-detail-display';
    displayDiv.innerHTML = `
        <p><strong>Name:</strong> ${exercise.name}</p>
        <p><strong>Description:</strong> ${exercise.description}</p>
        <p><strong>Muscle Group:</strong> ${exercise.muscle_group}</p>
        <p><strong>Intensity:</strong> ${exercise.intensity}</p>
    `;
    return displayDiv;
}

function createExerciseDetailForm(exercise) {
    const form = document.createElement('form');
    form.className = 'exercise-form';
    form.method = 'post';

    ['description', 'equipment_needed', 'weight', 'rating', 'sets', 'reps'].forEach(field => {
        form.appendChild(createInputField(capitalizeFirstLetter(field), exercise[field], field));
    });

    const intensitySelect = createIntensitySelect(exercise.intensity);
    form.appendChild(createInputLabel('Intensity', intensitySelect));

    return form;
}

function createInputField(label, value, name) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-field';
    const labelElement = document.createElement('label');
    labelElement.textContent = `${label}: `;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.name = name;
    wrapper.appendChild(labelElement);
    wrapper.appendChild(input);
    return wrapper;
}

function createInputLabel(label, element) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-field';
    const labelElement = document.createElement('label');
    labelElement.textContent = `${label}: `;
    wrapper.appendChild(labelElement);
    wrapper.appendChild(element);
    return wrapper;
}

function createIntensitySelect(currentValue) {
    const select = document.createElement('select');
    ['Light', 'Moderate', 'Vigorous'].forEach(intensity => {
        const option = document.createElement('option');
        option.value = intensity;
        option.text = intensity;
        if (intensity === currentValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    select.name = 'intensity';
    return select;
}

function createExerciseCheckbox(exercise, workoutId, action) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'select-checkbox';
    checkbox.name = `${action}-exercise`;
    checkbox.value = exercise.id;
    checkbox.onchange = function() {
        if (this.checked && action === 'insert') {
            insertExercise(exercise.id, workoutId);
        } else if (this.checked && action === 'delete') {
            deleteExercise(exercise.id, workoutId);
        }
    };
    return checkbox;
}

function appendNavigationButton(container, workoutId) {
    const button = document.createElement('button');
    button.textContent = 'Add Exercises';
    button.onclick = function() {
        window.location.href = `/add-or-edit-workout/${workoutId}`;
    };
    container.appendChild(button);
}

function getWorkoutIdFromUrl() {
    const urlSegments = window.location.pathname.split('/');
    return urlSegments[urlSegments.length - 1];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function insertExercise(exerciseDetailId, workoutId) {
    fetch('/insert-exercise', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            exercise_detail_id: exerciseDetailId,
            workout_id: workoutId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error inserting exercise:', error);
    });
}

function deleteExercise(exerciseDetailId, workoutId) {
    fetch('/delete-exercise', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            exercise_detail_id: exerciseDetailId,
            workout_id: workoutId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error deleting exercise:', error);
    });
}
