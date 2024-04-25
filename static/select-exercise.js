document.addEventListener('DOMContentLoaded', function() {
    var taskBtn = document.getElementById('task-btn');
    if (taskBtn) {
        taskBtn.addEventListener('click', function() {
            alert('Selected Exercise');
            window.location.href = selectExerciseUrl;  // Use the URL defined in the HTML
        });
    }
});
