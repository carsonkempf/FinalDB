document.addEventListener('DOMContentLoaded', function() {
    // Get the select exercise button element by its class
    const selectExerciseBtn = document.querySelector('.select-exercise-btn');

    if (selectExerciseBtn) {
        selectExerciseBtn.addEventListener('click', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const workoutId = urlParams.get('workout_id');

            if (workoutId) {
                window.location.href = `/select-exercise.html?workout_id=${workoutId}`; // Ensure the extension is correct as per your setup
            } else {
                console.error('Workout ID not found in URL.');
            }
        });
    }
});
