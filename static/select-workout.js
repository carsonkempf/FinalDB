document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('workouts-container');

    // Fetch all workouts from the backend.
    fetch('/api/workouts')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                container.textContent = 'No workouts available to display.';
                return;
            }

            // Create elements for each workout and append to the container.
            data.forEach(workout => {
                const workoutDiv = document.createElement('div');
                workoutDiv.className = 'workout-item';

                // Display workout details
                const workoutDetails = document.createElement('p');
                workoutDetails.textContent = `Name: ${workout.name}, Focus: ${workout.focus}, Intensity: ${workout.intensity}`;


                const scheduleButton = document.createElement('button');
                scheduleButton.textContent = 'Schedule';
                scheduleButton.addEventListener('click', () => {
                    window.location.href = `/schedule`;  // Assuming there is a route to schedule workouts
                });

                // Append details and buttons to workoutDiv
                workoutDiv.appendChild(workoutDetails);
                workoutDiv.appendChild(editButton);
                workoutDiv.appendChild(scheduleButton);
                container.appendChild(workoutDiv);
            });
        })
        .catch(error => {
            console.error('Error loading workouts:', error);
            container.textContent = 'Failed to load workouts.';
        });
});
