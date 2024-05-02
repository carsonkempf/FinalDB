document.addEventListener("DOMContentLoaded", function () {
    const tbody = document.querySelector("#scheduleTable tbody");
    const workoutContainer = document.getElementById("workoutContainer");
    const workoutDetails = document.getElementById("workoutDetails");
    const currentMonth = dayjs(); // Use dayjs to manage dates
    const startOfMonth = currentMonth.startOf('month').day(); // Day.js to find the first day of the month
    const daysInMonth = currentMonth.daysInMonth(); // Number of days in the current month
    let dayCount = 1;

    for (let i = 0; i < 6; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement("td");
            if (i === 0 && j < startOfMonth || dayCount > daysInMonth) {
                cell.innerText = "";
            } else {
                cell.innerText = dayCount;
                cell.dataset.cellNumber = dayCount;
                cell.addEventListener("click", function () {
                    handleWorkoutDayClick(parseInt(this.innerText));
                });
                dayCount++;
            }
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }

    function handleWorkoutDayClick(day) {
        switch (day) {
            case 1:
                workoutDetails.innerText = "Yoga and Stretching exercises.";
                break;
            case 4:
                workoutDetails.innerText = "Cardio: Running 5km or cycling.";
                break;
            case 13:
                workoutDetails.innerText = "Strength training: Upper body workout.";
                break;
            case 14:
                workoutDetails.innerText = "Strength training: Lower body workout.";
                break;
            default:
                workoutContainer.style.display = "none";
                return;
        }
        workoutContainer.style.display = "block";
    }
});
