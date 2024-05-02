document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/workouts')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('workouts-container');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)'; // 3 columns
        container.style.gap = '20px'; // Spacing between grid items

        data.forEach(item => {
            const workoutDiv = document.createElement('div');
            workoutDiv.className = 'workout';

            const nameHeader = document.createElement('h2');
            nameHeader.textContent = item.name;
            workoutDiv.appendChild(nameHeader);

            const detailsList = document.createElement('ul');
            Object.entries(item).forEach(([key, value]) => {
                if (!['workout_id', 'workout_detail_id', 'name'].includes(key)) {
                    const detail = document.createElement('li');
                    detail.textContent = `${mapColumnToTitle(key)}: ${value}`;
                    detailsList.appendChild(detail);
                }
            });
            workoutDiv.appendChild(detailsList);

            const editButton = createButton('Edit', 'edit-btn');
            const deleteButton = createButton('Delete', 'delete-btn');
            workoutDiv.append(editButton, deleteButton);

            container.appendChild(workoutDiv);
        });
    })
    .catch(error => console.error('Error loading the workouts:', error));
});

function mapColumnToTitle(columnName) {
    const titles = {
        'description': 'Description',
        'workout_type': 'Type',
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
