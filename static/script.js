document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/exercises')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('exercises-container');
        // Ensure container is set up for grid display
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)'; // 3 columns
        container.style.gap = '20px'; // Spacing between grid items

        data.forEach(item => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise';

            const nameHeader = document.createElement('h2');
            nameHeader.textContent = item.name;
            exerciseDiv.appendChild(nameHeader);

            const detailsList = document.createElement('ul');
            detailsList.style.padding = '0'; // Remove default padding
            detailsList.style.listStyle = 'none'; // Remove list styling

            Object.entries(item).forEach(([key, value]) => {
                if (!['exercise_id', 'exercise_detail_id', 'name'].includes(key)) {
                    const detail = document.createElement('li');
                    detail.textContent = `${mapColumnToTitle(key)}: ${value}`;
                    detail.style.fontSize = '0.8em'; // Smaller font size for details
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
        'rating': 'Rating',
        'sets': 'Sets',  // Added if exists in the data model
        'reps': 'Reps'   // Added if exists in the data model
    };
    return titles[columnName] || columnName;
}

function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.style.padding = '5px 10px'; // Adjust button padding
    button.style.marginTop = '10px'; // Space from details list
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
