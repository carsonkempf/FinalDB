document.addEventListener('DOMContentLoaded', function() {
    var taskBtn = document.getElementById('task-btn');
    if (taskBtn) {
        taskBtn.addEventListener('click', function() {
            alert('Workout Added');
            window.location.href = workoutListUrl;  // Use the URL defined in the HTML
        });
    }
});