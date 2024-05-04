document.addEventListener("DOMContentLoaded", function () {
    const workoutsContainer = document.getElementById("workouts-container");

    // Fetch all workouts from the database
    fetch('/api/workouts')
        .then(response => response.json())
        .then(workouts => {
            workouts.forEach(workout => {
                // Create a container for each workout
                const workoutDiv = document.createElement('div');
                workoutDiv.className = 'workout-item';

                // Display workout details
                workoutDiv.innerHTML = `
                    <h3>${workout.name}</h3>
                    <p>Description: ${workout.description || 'N/A'}</p>
                    <button class="schedule-button" data-workout-id="${workout.workout_id}">Schedule</button>
                `;

                // Add click event listener to the schedule button
                const scheduleButton = workoutDiv.querySelector('.schedule-button');
                scheduleButton.addEventListener('click', () => scheduleWorkout(workout.workout_id));

                // Append the workout container to the main container
                workoutsContainer.appendChild(workoutDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching workouts:', error);
            // Handle error if needed
        });
});

// Function to schedule a workout for the selected day
function scheduleWorkout(workoutId) {
    const urlParams = new URLSearchParams(window.location.search);
    const dayId = urlParams.get('day_id');

    if (dayId) {
        // Send a request to the backend to join the workout with the day
        fetch(`/api/schedule-workout/${dayId}/${workoutId}`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    // Redirect to schedule.html on success
                    window.location.href = '/schedule.html';
                } else {
                    console.error('Failed to schedule workout:', response.statusText);
                    // Handle error if needed
                }
            })
            .catch(error => {
                console.error('Error scheduling workout:', error);
                // Handle error if needed
            });
    } else {
        console.error('Day ID not found in URL');
        // Handle error if needed
    }
}
