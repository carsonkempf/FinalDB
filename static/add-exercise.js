document.addEventListener('DOMContentLoaded', function() {
    var taskBtn = document.getElementById('task-btn');
    if (taskBtn) {
        taskBtn.addEventListener('click', function() {
            alert('Performing a task...');
            window.location.href = workoutListUrl;  // Use the URL defined in the HTML
        });
    }
});
