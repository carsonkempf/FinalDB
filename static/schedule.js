document.addEventListener("DOMContentLoaded", function () {
    const tbody = document.querySelector("tbody");
    const tableNumber = 1; // Starting table number
    const totalCells = 7 * 6; // Total number of cells in the table

    for (let i = 0; i < 6; i++) { // Update to 6 rows
        const row = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement("td");
            const cellNumber = i * 7 + j + 1; // Calculate cell number
            cell.dataset.cellNumber = cellNumber; // Set cell number as a data attribute
            cell.addEventListener("click", function () {
                // Get the day of the week for the clicked cell
                const clickedDayOfWeek = getDayOfWeek(cellNumber);
                // Get the day of the week for the present month
                const currentDayOfWeek = getDayOfWeekOfMonth();
                // Compare the clicked cell's day of the week with the current day of the week
                if (clickedDayOfWeek === currentDayOfWeek) {
                    alert("Cell Number: " + cellNumber + " - Correct day of the week!");
                } else {
                    alert("Cell Number: " + cellNumber + " - Incorrect day of the week!");
                }
            });
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }

    // Add event listeners to buttons
    const button1 = document.getElementById("button1");
    button1.addEventListener("click", function () {
        alert("Button 1 clicked");
    });

    const button2 = document.getElementById("button2");
    button2.addEventListener("click", function () {
        alert("Button 2 clicked");
    });
});

function getDayOfWeekOfMonth() {
    const currentDate = new Date(); // Get current date
    const currentDayOfMonth = currentDate.getDate(); // Get current day of the month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Get the first day of the month
    const startingDayOfWeek = firstDayOfMonth.getDay(); // Get the day of the week for the first day of the month (0-6, 0: Sunday, 1: Monday, ..., 6: Saturday)
    
    // Calculate the day of the week for the current day of the month (1-7)
    let dayOfWeek = (currentDayOfMonth + startingDayOfWeek - 1) % 7 + 1;
    if (dayOfWeek === 0) {
        dayOfWeek = 7; // Adjust Sunday to 7 instead of 0
    }
    
    return dayOfWeek;
}

function getDayOfWeek(cellNumber) {
    const currentDate = new Date(); // Get current date
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Get the first day of the month
    const startingDayOfWeek = firstDayOfMonth.getDay(); // Get the day of the week for the first day of the month (0-6, 0: Sunday, 1: Monday, ..., 6: Saturday)
    
    // Calculate the day of the week for the clicked cell
    let dayOfWeek = (cellNumber + startingDayOfWeek - 1) % 7 + 1;
    if (dayOfWeek === 0) {
        dayOfWeek = 7; // Adjust Sunday to 7 instead of 0
    }
    
    return dayOfWeek;
}
