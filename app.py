from flask import Flask, render_template, jsonify, g, request, redirect, url_for
import uuid
import sqlite3

app = Flask(__name__)
DATABASE = 'workoutdatabase.db'

def get_db():
    if 'sqlite_db' not in g:
        g.sqlite_db = sqlite3.connect(DATABASE)
        g.sqlite_db.row_factory = sqlite3.Row
    return g.sqlite_db

@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop('sqlite_db', None)
    if db is not None:
        db.close()

@app.route('/')
def exercise_list():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Exercise")
    exercises = cur.fetchall()
    return render_template('exercise-list.html', exercises=exercises)

@app.route('/workout-list')
def workout_list():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Workout")
    workouts = cur.fetchall()
    return render_template('workout-list.html', workouts=workouts)

@app.route('/schedule')
def schedule():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT d.*, w.name AS workout_name, w.description AS workout_description
        FROM Day d
        JOIN Workout_On_Day wod ON d.day_id = wod.day_id
        JOIN Workout w ON wod.workout_id = w.workout_id
    """)
    days_with_workouts = cur.fetchall()
    return render_template('schedule.html', days=days_with_workouts)

scheduled_workouts = []

@app.route('/api/schedule-workout/<day_id>/<workout_id>', methods=['POST'])
def schedule_workout(day_id, workout_id):
    try:
        day_id = int(day_id)
        workout_id = int(workout_id)
        scheduled_workouts.append({'day_id': day_id, 'workout_id': workout_id})
        return jsonify({'message': 'Workout scheduled successfully'}), 200
    except ValueError:
        return jsonify({'error': 'Invalid day_id or workout_id'}), 400

@app.route('/api/workouts-by-day/<day_id>')
def get_workouts_by_day(day_id):
    try:
        day_id = int(day_id)
        day_workouts = [sw['workout_id'] for sw in scheduled_workouts if sw['day_id'] == day_id]
        return jsonify({'day_id': day_id, 'workouts': day_workouts}), 200
    except ValueError:
        return jsonify({'error': 'Invalid day_id'}), 400

@app.route('/api/exercises')
def api_exercises():
    filter_option = request.args.get('filter', None)

    # Define the base SQL query to retrieve all exercises
    sql_query = "SELECT * FROM Exercise"

    db = get_db()
    cur = db.cursor()

    # Execute the base SQL query to retrieve all exercises
    cur.execute(sql_query)
    exercises = cur.fetchall()

    if filter_option:
        # Handle filter options
        if filter_option == 'rating_high_low':
            exercises = sorted(exercises, key=lambda x: x['rating'], reverse=True)
        elif filter_option == 'rating_low_high':
            exercises = sorted(exercises, key=lambda x: x['rating'])
        elif filter_option == 'intensity_light':
            exercises = [exercise for exercise in exercises if exercise['intensity'] == 'Light']
        elif filter_option == 'intensity_moderate':
            exercises = [exercise for exercise in exercises if exercise['intensity'] == 'Moderate']
        elif filter_option == 'intensity_vigorous':
            exercises = [exercise for exercise in exercises if exercise['intensity'] == 'Vigorous']
        elif filter_option == 'muscle_chest':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Chest']
        elif filter_option == 'muscle_back':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Back']
        elif filter_option == 'muscle_shoulders':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Shoulders']
        elif filter_option == 'muscle_arms':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Arms']
        elif filter_option == 'muscle_abdominals':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Abdominals']
        elif filter_option == 'muscle_lower_back':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Lower Back']
        elif filter_option == 'muscle_hips':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Hips']
        elif filter_option == 'muscle_thighs':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Thighs']
        elif filter_option == 'muscle_legs':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Legs']
        elif filter_option == 'muscle_adductors_abductors':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Adductors and Abductors']
        else:
            # Invalid filter option
            return jsonify({'error': 'Invalid filter option'}), 400
    # Convert exercises to JSON format and return
    return jsonify([dict(x) for x in exercises])


@app.route('/api/workouts')
def api_workouts():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Workout")
    workouts = cur.fetchall()
    return jsonify([dict(x) for x in workouts])

@app.route('/api/exercises/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    db = get_db()
    db.execute("DELETE FROM Exercise WHERE exercise_id = ?", (exercise_id,))
    db.commit()
    return jsonify({'success': True}), 200

@app.route('/api/exercises/<int:workout_id>')
def api_exercises_by_workout(workout_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT DISTINCT e.* 
        FROM Exercise e 
        JOIN Exercise_In_Workout eiw ON e.exercise_id = eiw.exercise_id 
        WHERE eiw.workout_id = ?
    """, (workout_id,))
    exercises = cur.fetchall()
    return jsonify([dict(x) for x in exercises])

@app.route('/select-exercise/<int:workout_id>')
def select_exercise(workout_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT DISTINCT * FROM Exercise")
    exercises = cur.fetchall()
    return render_template('select-exercise.html', exercises=exercises, workout_id=workout_id)

@app.route('/add-exercise', methods=['GET', 'POST'])
def add_exercise():
    if request.method == 'POST':
        name = request.form['name']
        muscle_group = request.form['muscle_group']
        intensity = request.form.get('intensity', '')
        rating = request.form.get('rating', '')  # Get the rating value from the form
        description = request.form.get('description', '')
        db = get_db()
        db.execute("INSERT INTO Exercise (name, muscle_group, intensity, rating, description) VALUES (?, ?, ?, ?, ?)",
                   (name, muscle_group, intensity, rating, description))  # Insert the rating value into the database
        db.commit()
        return redirect(url_for('exercise_list'))
    return render_template('add-exercise.html')


@app.route('/edit-exercise/<int:exercise_id>', methods=['GET', 'POST'])
def edit_exercise(exercise_id):
    db = get_db()
    if request.method == 'POST':
        name = request.form['name']
        muscle_group = request.form['muscle_group']
        intensity = request.form.get('intensity', '')
        description = request.form.get('description', '')
        db.execute("UPDATE Exercise SET name=?, muscle_group=?, intensity=?, description=? WHERE exercise_id=?", (name, muscle_group, intensity, description, exercise_id))
        db.commit()
        return redirect(url_for('exercise_list'))
    else:
        cur = db.cursor()
        cur.execute("SELECT * FROM Exercise WHERE exercise_id = ?", (exercise_id,))
        exercise = cur.fetchone()
        return render_template('edit-exercise.html', exercise=exercise)

@app.route('/add-workout', methods=['GET', 'POST'])
def add_workout():
    # Generate a unique workout_id
    generated_workout_id = generate_workout_id()

    # Define the valid focus options
    valid_focus_options = ('General', 'Strength Training', 'Cardiovascular Health', 'Weight Loss', 'Flexibility', 'Balance and Coordination', 'Endurance Training', 'High-Intensity Interval Training (HIIT)', 'Muscle Toning', 'Core Strengthening', 'Functional Fitness', 'Rehabilitation and Recovery', 'Sports Specific Training', 'Bodybuilding', 'Circuit Training', 'Mind-Body Wellness')

    if request.method == 'POST':
        db = get_db()
        name = request.form['name']
        description = request.form.get('description', 'No description provided')
        intensity = request.form.get('intensity', 'Medium')
        focus = request.form.get('focus', 'General')  # Ensure a default value if not provided
        
        # Check if the focus value is valid, if not, set it to a default value
        if focus not in valid_focus_options:
            focus = 'General'  # Set a default focus if not valid
        
        # Insert the workout into the database
        db.execute("INSERT INTO Workout (workout_id, name, description, intensity, focus) VALUES (?, ?, ?, ?, ?)",
                   (generated_workout_id, name, description, intensity, focus))
        db.commit()
        return redirect(url_for('workout_list'))
    
    return render_template('add-workout.html', generated_workout_id=generated_workout_id)


@app.route('/api/add-exercises-to-workout/<int:workout_id>', methods=['POST'])
def add_exercises_to_workout(workout_id):
    db = get_db()
    exercises = request.json.get('exercises')
    try:
        for exercise_id in exercises:
            db.execute("INSERT INTO Exercise_In_Workout (exercise_id, workout_id) VALUES (?, ?)",
                       (exercise_id, workout_id))
        db.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.rollback()
        print(e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    db = get_db()
    db.execute("DELETE FROM Workout WHERE workout_id = ?", (workout_id,))
    db.commit()
    return jsonify({'success': True}), 200

@app.route('/edit-workout/<int:workout_id>', methods=['GET', 'POST'])
def edit_workout(workout_id):
    db = get_db()
    if request.method == 'POST':
        name = request.form['name']
        description = request.form.get('description', '')
        intensity = request.form.get('intensity', '')
        focus = request.form.get('focus', '')
        db.execute("UPDATE Workout SET name=?, description=?, intensity=?, focus=? WHERE workout_id=?",
                   (name, description, intensity, focus, workout_id))
        db.commit()
        return redirect(url_for('workout_list'))
    else:
        cur = db.cursor()
        cur.execute("SELECT * FROM Workout WHERE workout_id = ?", (workout_id,))
        workout = cur.fetchone()
        return render_template('edit-workout.html', workout=workout)

def generate_workout_id():
    workout_uuid = uuid.uuid4()
    return int(workout_uuid.int % (2**31 - 1))

@app.route('/create-workout', methods=['GET'])
def create_workout():
    workout_id = generate_workout_id()
    db = get_db()
    db.execute("INSERT INTO Workout (workout_id, name, description) VALUES (?, ?, ?)", (workout_id, 'New Workout', 'Description here'))
    db.commit()
    return redirect(url_for('select_exercise', workout_id=workout_id))

def generate_day_id():
    day_uuid = uuid.uuid4()
    return str(day_uuid)

@app.route('/api/generate-day-id', methods=['GET'])
def generate_day_id_endpoint():
    day_id = generate_day_id()
    return jsonify(day_id=day_id)

@app.route('/api/add-day', methods=['POST'])
def add_day():
    data = request.get_json()
    day_id = data.get('day_id')
    if day_id:
        try:
            db = get_db()
            db.execute("INSERT INTO Day (day_id) VALUES (?)", (day_id,))
            db.commit()
            return jsonify({'success': True}), 200
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    else:
        return jsonify({'success': False, 'error': 'No day ID provided'}), 400

@app.route('/select-workout.html')
def select_workout():
    return render_template('select-workout.html')

if __name__ == '__main__':
    app.run(debug=True)
