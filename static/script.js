document.addEventListener('DOMContentLoaded', function() {
    // Fetch exercise data from the server
    fetch('/api/exercises')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('exercises-container');
        // Iterate through each exercise in the data array
        data.forEach(item => {
            // Create a div to hold the exercise details
            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise';

            // Create and append the exercise name as a header
            const nameHeader = document.createElement('h2');
            nameHeader.textContent = item.name;
            exerciseDiv.appendChild(nameHeader);

            // Create a list to hold each exercise detail
            const detailsList = document.createElement('ul');
            Object.entries(item).forEach(([key, value]) => {
                // Filter out ID fields and the name field when building the list
                if (!['exercise_id', 'exercise_detail_id', 'name'].includes(key)) {
                    const detail = document.createElement('li');
                    detail.textContent = `${mapColumnToTitle(key)}: ${value}`;
                    detailsList.appendChild(detail);
                }
            });
            exerciseDiv.appendChild(detailsList);

            // Create and append Edit and Delete buttons
            const editButton = createButton('Edit', 'edit-btn');
            const deleteButton = createButton('Delete', 'delete-btn');
            exerciseDiv.append(editButton, deleteButton);

            // Append the complete exercise div to the container on the page
            container.appendChild(exerciseDiv);
        });
    })
    .catch(error => console.error('Error loading the exercises:', error));
});

// Function to map database column names to user-friendly titles
function mapColumnToTitle(columnName) {
    const titles = {
        'description': 'Description',
        'exercise_type': 'Type',
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
