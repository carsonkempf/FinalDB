document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/exercises')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('exercises-container');
        data.forEach(item => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise';

            // Display the name and toggle button on the same line
            const headerDiv = document.createElement('div');
            headerDiv.className = 'exercise-header';
            const nameHeader = document.createElement('h2');
            nameHeader.textContent = item.name;
            headerDiv.appendChild(nameHeader);

            const toggleButton = createToggleButton(item.exercise_id);
            headerDiv.appendChild(toggleButton);
            exerciseDiv.appendChild(headerDiv);

            // Display each attribute in a list below the header
            const detailsList = document.createElement('ul');
            detailsList.className = 'exercise-details';
            Object.entries(item).forEach(([key, value]) => {
                if (!['exercise_id', 'exercise_detail_id', 'name'].includes(key)) {
                    const detail = document.createElement('li');
                    detail.textContent = `${mapColumnToTitle(key)}: ${value}`;
                    detailsList.appendChild(detail);
                }
            });
            exerciseDiv.appendChild(detailsList);

            container.appendChild(exerciseDiv);
        });
    })
    .catch(error => console.error('Error loading the exercises:', error));
});

function createToggleButton(exerciseId) {
    const button = document.createElement('button');
    button.className = 'toggle-btn';
    button.onclick = () => toggleSelection(exerciseId, button);
    return button;
}

function toggleSelection(exerciseId, button) {
    const isActive = button.classList.toggle('active');

    // Optionally, trigger any backend update or state change here
}

function mapColumnToTitle(columnName) {
    const titles = {
        'description': 'Description',
        'exercise_type': 'Type',
        'intensity': 'Intensity',
        'muscle_group': 'Muscle Group',
        'rating': 'Rating',
        'sets': 'Sets',
        'reps': 'Reps'
    };
    return titles[columnName] || columnName;
}




function submitSelectedExercises() {
    const selectedButtons = document.querySelectorAll('.toggle-btn.active');
    const selectedIds = Array.from(selectedButtons).map(btn => btn.dataset.exerciseId);

    fetch('/api/submit-exercises', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectedIds })
    })
    .then(response => response.json())
    .then(data => console.log('Submission successful', data))
    .catch(error => console.error('Error submitting exercises:', error));
}
