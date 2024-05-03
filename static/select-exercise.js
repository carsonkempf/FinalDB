document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('exercises-list-container'); 

    fetch('/api/exercises')
    .then(response => response.json())
    .then(data => {
        const seenExercises = new Set();  // A set to track seen exercise names

        data.forEach(exercise => {
            if (!seenExercises.has(exercise.name)) {  // Check if we've already processed this exercise
                seenExercises.add(exercise.name);

                const exerciseDiv = document.createElement('div');
                exerciseDiv.className = 'exercise-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'exercise-checkbox';
                checkbox.value = exercise.id;

                const label = document.createElement('label');
                label.textContent = `${exercise.name} - Type: ${exercise.type || 'N/A'}, Muscle Group: ${exercise.muscle_group}, Intensity: ${exercise.intensity}`;
                label.insertBefore(checkbox, label.firstChild);  // Insert checkbox before label text

                exerciseDiv.appendChild(label);
                container.appendChild(exerciseDiv);
            }
        });

        // Create and append the 'Done' button
        const doneButton = document.createElement('button');
        doneButton.textContent = 'Done';
        doneButton.addEventListener('click', submitSelectedExercises);
        container.appendChild(doneButton);
    })
    .catch(error => {
        console.error('Error loading the exercises:', error);
        container.textContent = 'Failed to load exercises.';
    });
});

function submitSelectedExercises() {
    const selectedExercises = Array.from(document.querySelectorAll('.exercise-checkbox:checked'))
                                  .map(checkbox => parseInt(checkbox.value, 10)); // Ensure IDs are integers

    const urlParams = new URLSearchParams(window.location.search);
    const workoutId = urlParams.get('workout_id');

    console.log('Selected Exercises:', selectedExercises); // Debugging log
    console.log('Workout ID:', workoutId); // Debugging log

    if (workoutId && selectedExercises.length > 0) {
        fetch(`/api/add-exercises-to-workout/${workoutId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ exercises: selectedExercises })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response:', data); // Debugging log
            if (data.success) {
                alert('Exercises added successfully!');
                window.location.href = `/add-workout.html?workout_id=${workoutId}`; // Redirect on success
            } else {
                alert('Failed to add exercises to the workout');
            }
        })
        .catch(error => {
            console.error('Error submitting exercises:', error);
            alert('There was an error processing your request.');
        });
    } else {
        alert('No exercises selected or workout ID missing.');
    }
}
