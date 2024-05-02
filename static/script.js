document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/exercises')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('exercises-container');
        data.forEach(item => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise';

            const nameHeader = document.createElement('h2');
            nameHeader.textContent = item.name;
            exerciseDiv.appendChild(nameHeader);

            const detailsList = document.createElement('ul');
            Object.entries(item).forEach(([key, value]) => {
                if (!['exercise_id', 'exercise_detail_id', 'name'].includes(key)) {
                    const detail = document.createElement('li');
                    detail.textContent = `${mapColumnToTitle(key)}: ${value}`;
                    detailsList.appendChild(detail);
                }
            });
            exerciseDiv.appendChild(detailsList);

            const editButton = createButton('Edit', 'edit-btn');
            const deleteButton = createButton('Delete', 'delete-btn');
            deleteButton.onclick = () => deleteExercise(item.exercise_id);
            exerciseDiv.append(editButton, deleteButton);

            container.appendChild(exerciseDiv);
        });
    })
    .catch(error => console.error('Error loading the exercises:', error));
});

function mapColumnToTitle(columnName) {
    const titles = {
        'description': 'Description',
        'exercise_type': 'Type',
        'intensity': 'Intensity',
        'muscle_group': 'Muscle Group',
        'rating': 'Rating'
    };
    return titles[columnName] || columnName;
}

function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    return button;
}

function deleteExercise(exerciseId) {
    fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE' })
    .then(response => {
        if (response.ok) {
            console.log('Exercise deleted successfully');
            location.reload(); // Reload the page to update the list of exercises
        }
    })
    .catch(error => console.error('Error deleting exercise:', error));
}
