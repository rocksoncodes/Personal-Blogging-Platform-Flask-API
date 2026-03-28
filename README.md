
# Flask Articles API

A Flask REST API for managing blog articles. Built as a foundational project to establish clean API structure habits, blueprints for organisation, environment-based database config and straightforward CRUD endpoints for titles, authors and categories.


## Features
- Create new articles
- Retrieve all articles or a single article by ID
- Update existing articles
- Delete articles
- Environment-based database configuration
- Uses Flask blueprints for better project structure


## Project Structure
```

.
├── app
│   ├── init.py
│   ├── database.py  # Database 
│   ├── routes.py    # CRUD routes
├── run.py           # Main entry point
├── .env.example     # Example env
├── requirements.txt # Python dependencies
└── README.md        # Documentation

````

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Personal-Blogging-Platform-Flask-API.git
cd Personal-Blogging-Platform-Flask-API
````

### 2. Create a Virtual Environment

```
python -m venv venv
```

### 3. Install Dependencies

```
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add:

```
DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/database_name"
```

You may replace the MySQL URL with PostgreSQL, SQLite, or any database supported by SQLAlchemy.


## Running the Application

```bash
python run.py
```

The application will start on:

```
http://127.0.0.1:5000
```

## API Endpoints

### 1. Create an Article

POST `/create/article`
Request Body (JSON):

```json
{
    "title": "My First Article",
    "author": "John Doe",
    "category": "Technology"
}
```

Response:

```json
{"Alert": "Success! Article has been created..."}
```

---

### 2. Get All Articles

GET `/get/article`
Response:

```json
[
    {
        "title": "My First Article",
        "author": "John Doe",
        "category": "Technology"
    }
]
```

---

### 3. Get Article by ID

GET `/get/article/<id>`
Example: `/get/article/1`
Response:

```json
{
    "title": "My First Article",
    "author": "John Doe",
    "category": "Technology"
}
```

---

### 4. Update an Article

PUT `/update/article/<id>`
Request Body (JSON):

```json
{
    "title": "Updated Title",
    "author": "Jane Doe",
    "category": "Science"
}
```

Response:

```json
{"Alert": "Success! Article has been updated..."}
```

---

### 5. Delete an Article

DELETE `/delete/article/<id>`
Example: `/delete/article/1`
Response:

```json
{"Alert": "Updated Title by Jane Doe has been deleted..."}
```

## Testing the API with Postman
````markdown


You can use [Postman](https://www.postman.com/downloads/) to test the API endpoints after running the application.
````
---

### 1. Create an Article
- Method: `POST`  
- URL: `http://127.0.0.1:5000/create/article`  
- Body (JSON):
```json
{
    "title": "My First Article",
    "author": "John Doe",
    "category": "Technology"
}
````

* Expected Response:

```json
{"Alert": "Success! Article has been created..."}
```

---

### 2. Get All Articles

* Method: `GET`
* URL: `http://127.0.0.1:5000/get/article`
* Expected Response:

```json
[
    {
        "title": "My First Article",
        "author": "John Doe",
        "category": "Technology"
    }
]
```

---

### 3. Get an Article by ID

* Method: `GET`
* URL: `http://127.0.0.1:5000/get/article/1`
* Expected Response:

```json
{
    "title": "My First Article",
    "author": "John Doe",
    "category": "Technology"
}
```

---

### 4. Update an Article

* Method: `PUT`
* URL: `http://127.0.0.1:5000/update/article/1`
* Body (JSON):

```json
{
    "title": "Updated Title",
    "author": "Jane Doe",
    "category": "Science"
}
```

* Expected Response:

```json
{"Alert": "Success! Article has been updated..."}
```

---

### 5. Delete an Article

* Method: `DELETE`
* URL: `http://127.0.0.1:5000/delete/article/1`
* Expected Response:

```json
{"Alert": "Updated Title by Jane Doe has been deleted..."}
```



## Tip

For quick testing, you can create a **Postman Collection** with all these endpoints so you can run them in sequence and see the responses.


## Requirements

* Python 3.8 or higher
* Flask
* SQLAlchemy
* python-dotenv

Install all dependencies:

```bash
pip install -r requirements.txt
```


## Notes

* The API runs in **debug mode** during development.
* For production, disable debug mode and run the application with a WSGI server such as **Gunicorn**.
* Compatible with any database supported by SQLAlchemy.
