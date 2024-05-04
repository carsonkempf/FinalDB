document.addEventListener("DOMContentLoaded", function () {
    const tbody = document.querySelector("#scheduleTable tbody");

    // Function to generate a row of cells for a week
    function generateWeekRow() {
        const row = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement("td");
            row.appendChild(cell);
        }
        return row;
    }

    // Function to handle click events on a day cell
    function handleWorkoutDayClick() {
        const dayId = this.dataset.dayId;
        console.log("Clicked on day with ID:", dayId);
        const scheduleContainer = document.getElementById("scheduleContainer");

        // Clear existing content
        scheduleContainer.innerHTML = "";

        // Create a container with the day ID
        const container = document.createElement("div");
        container.classList.add("popup-container");

        const dayIdElement = document.createElement("p");
        dayIdElement.textContent = "Day ID: " + dayId;
        container.appendChild(dayIdElement);

        // Add a button to schedule workout
        const scheduleButton = document.createElement("button");
        scheduleButton.textContent = "Schedule Workout";
        scheduleButton.addEventListener("click", function() {
            // Redirect to select-workout.html with the day ID as a query parameter
            window.location.href = `/select-workout.html?day_id=${dayId}`;
        });
        container.appendChild(scheduleButton);

        // Append the container to the schedule container
        scheduleContainer.appendChild(container);
        // Ensure the schedule container is visible
        scheduleContainer.style.display = "block";
    }

    // Function to generate the schedule table
    function generateScheduleTable() {
        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        let dayCount = 1;

        for (let i = 0; i < 6; i++) {
            const row = generateWeekRow();
            for (let j = 0; j < 7; j++) {
                const cell = row.children[j];
                if (dayCount <= daysInMonth) {
                    cell.textContent = dayCount;
                    if (!cell.dataset.dayId) {
                        // Generate unique day ID only if it doesn't already exist
                        const dayId = generateDayId();
                        cell.dataset.dayId = dayId;
                    }
                    cell.addEventListener("click", handleWorkoutDayClick); // Attach click event listener
                    dayCount++;
                }
            }
            tbody.appendChild(row);
        }
    }

    generateScheduleTable(); // Generate the schedule table when the page loads
});

function generateDayId() {
    return Math.floor(Math.random() * 1000000); // Simple random ID generator
}
