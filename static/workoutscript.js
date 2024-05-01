document.addEventListener('DOMContentLoaded', function() {
    // Fetch workout data from the server
    fetch('/api/workouts')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('workouts-container');
        // Iterate through each workout in the data array
        data.forEach(item => {
            // Create a div to hold the workout details
            const workoutDiv = document.createElement('div');
            workoutDiv.className = 'workout';

            // Create and append the workout name as a header
            const nameHeader = document.createElement('h2');
            nameHeader.textContent = item.name;
            workoutDiv.appendChild(nameHeader);

            // Create a list to hold each workout detail
            const detailsList = document.createElement('ul');
            Object.entries(item).forEach(([key, value]) => {
                // Filter out ID fields and the name field when building the list
                if (!['workout_id', 'workout_detail_id', 'name'].includes(key)) {
                    const detail = document.createElement('li');
                    detail.textContent = `${mapColumnToTitle(key)}: ${value}`;
                    detailsList.appendChild(detail);
                }
            });
            workoutDiv.appendChild(detailsList);

            // Create and append Edit and Delete buttons
            const editButton = createButton('Edit', 'edit-btn');
            const deleteButton = createButton('Delete', 'delete-btn');
            workoutDiv.append(editButton, deleteButton);

            // Append the complete workout div to the container on the page
            container.appendChild(workoutDiv);
        });
    })
    .catch(error => console.error('Error loading the workouts:', error));
});

// Function to map database column names to user-friendly titles
function mapColumnToTitle(columnName) {
    const titles = {
        'description': 'Description',
        'workout_type': 'Type',
        'intensity': 'Intensity',
        'muscle_group': 'Muscle Group',
        'rating': 'Rating'
    };
    return titles[columnName] || columnName;  // Fallback to the column name if no title is found
}

// Helper function to create buttons with specified text and class
function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    return button;
}
