# Code Guideline

## 1. Project Overview

This project is a web-based automation tool designed to streamline communication with conference attendees. It utilizes React for the frontend, Python Flask for the backend, MySQL for the database, and Firebase Authentication for user authentication. Key architectural decisions include a component-based frontend, a RESTful API backend, and a domain-driven code organization.

## 2. Core Principles

*   **Readability**: Code must be easily understood by other developers.
*   **Maintainability**: Code must be structured for easy modification and updates.
*   **Testability**: Code must be written in a way that facilitates unit and integration testing.
*   **Efficiency**: Code should perform optimally with minimal resource usage.
*   **Security**: Code must protect user data and prevent vulnerabilities.

## 3. Language-Specific Guidelines

### 3.1. React (Frontend)

#### File Organization and Directory Structure

*   Components should be organized into directories based on their function or feature.
*   Each component directory should contain the component's JavaScript file (e.g., `MyComponent.js`), CSS module (e.g., `MyComponent.module.css`), and any related test files (e.g., `MyComponent.test.js`).
*   Shared components should be placed in a `components` directory.
*   Page-level components should be placed in a `pages` directory.
*   API service calls should be placed in a `services` directory.

Example:

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.js
│   │   ├── Button.module.css
│   │   └── Button.test.js
│   └── Input/
│       ├── Input.js
│       ├── Input.module.css
│       └── Input.test.js
├── pages/
│   ├── Home/
│   │   ├── Home.js
│   │   └── Home.module.css
│   └── AttendeeList/
│       ├── AttendeeList.js
│       └── AttendeeList.module.css
├── services/
│   └── attendeeService.js
└── App.js
```

#### Import/Dependency Management

*   Use absolute imports for modules within the `src` directory.
*   Group imports by their source (e.g., libraries, components, styles).
*   Alphabetize imports within each group.

Example:

```javascript
// React Component
import React from 'react';

// External Libraries
import axios from 'axios';

// Internal Components
import Button from 'components/Button/Button';
import Input from 'components/Input/Input';

// Styles
import styles from './Home.module.css';
```

#### Error Handling Patterns

*   Use `try...catch` blocks to handle potential errors during API calls or data processing.
*   Display user-friendly error messages to the user.
*   Log errors to the console or a logging service for debugging.

Example:

```javascript
async function fetchData() {
    try {
        const response = await axios.get('/api/attendees');
        setData(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch attendee data. Please try again later.');
    }
}
```

### 3.2. Python/Flask (Backend)

#### File Organization and Directory Structure

*   Follow a modular structure with clear separation of concerns.
*   Use blueprints to organize routes into logical groups (e.g., `user`, `email`, `data`).
*   Place database models in a `models.py` file.
*   Place business logic in a `services` directory.
*   Configuration settings should be in a `config.py` file.

Example:

```
backend/
├── app.py
├── models.py
├── routes/
│   ├── user.py
│   ├── email.py
│   └── data.py
├── services/
│   ├── user_service.py
│   ├── email_service.py
│   └── data_service.py
├── config.py
└── requirements.txt
```

#### Import/Dependency Management

*   Use `requirements.txt` to manage project dependencies.
*   Use virtual environments to isolate project dependencies.
*   Avoid circular dependencies.
*   Import specific modules or functions instead of entire libraries when possible.

Example:

```python
# Correct
from flask import Flask, request, jsonify

# Avoid
import flask
```

#### Error Handling Patterns

*   Use `try...except` blocks to handle potential exceptions.
*   Implement custom error handlers for specific error types.
*   Return appropriate HTTP status codes and error messages in API responses.
*   Log errors to a logging service.

Example:

```python
from flask import Flask, jsonify
from werkzeug.exceptions import NotFound

app = Flask(__name__)

@app.errorhandler(NotFound)
def handle_not_found(e):
    return jsonify(error=str(e)), 404

@app.route('/attendees/<int:id>')
def get_attendee(id):
    try:
        attendee = get_attendee_from_db(id)
        return jsonify(attendee)
    except NotFound as e:
        raise e  # Re-raise the exception to be handled by the error handler
    except Exception as e:
        app.logger.error(f"Error fetching attendee {id}: {e}")
        return jsonify(error="Internal Server Error"), 500
```

## 4. Code Style Rules

### 4.1. MUST Follow:

*   **Naming Conventions**:
    *   **Rationale**: Consistent naming improves readability and maintainability.
    *   Variables: Use camelCase (e.g., `attendeeName`).
    *   Functions: Use camelCase (e.g., `getAttendeeData()`).
    *   Classes: Use PascalCase (e.g., `AttendeeService`).
    *   Constants: Use UPPER_SNAKE_CASE (e.g., `MAX_ATTENDEES`).
    *   React components: Use PascalCase (e.g., `AttendeeList`).
    *   Python files: Use lowercase with underscores (e.g., `attendee_service.py`).
*   **Indentation**:
    *   **Rationale**: Consistent indentation enhances code structure and readability.
    *   Use 4 spaces for indentation in both React and Python.
*   **Comments**:
    *   **Rationale**: Comments explain the purpose and functionality of code.
    *   Write clear and concise comments to explain complex logic or non-obvious code.
    *   Use JSDoc style comments for React components and functions.
    *   Use docstrings for Python functions and classes.
*   **Code Formatting**:
    *   **Rationale**: Consistent formatting improves code aesthetics and reduces visual noise.
    *   Use a code formatter (e.g., Prettier for React, Black for Python) to automatically format code according to a consistent style.
*   **Error Handling**:
    *   **Rationale**: Proper error handling prevents unexpected crashes and provides useful debugging information.
    *   Always handle potential exceptions using `try...catch` (JavaScript) or `try...except` (Python) blocks.
    *   Log errors with sufficient context to facilitate debugging.
*   **API Endpoint Design**:
    *   **Rationale**: Well-designed APIs are easier to use and maintain.
    *   Use RESTful principles for API design.
    *   Use meaningful and consistent endpoint names.
    *   Return appropriate HTTP status codes.
    *   Use JSON for request and response bodies.
*   **State Management (React)**:
    *   **Rationale**: Structured state management prevents prop drilling and simplifies data flow.
    *   Use React Context or a state management library (e.g., Redux, Zustand) for managing global state.
    *   Keep component state minimal and focused on UI-related data.

### 4.2. MUST NOT Do:

*   **Global Variables**:
    *   **Rationale**: Global variables can lead to naming conflicts and unpredictable behavior.
    *   Avoid using global variables. Use module-level variables or dependency injection instead.
*   **Magic Numbers**:
    *   **Rationale**: Magic numbers make code difficult to understand and maintain.
    *   Avoid using hardcoded numerical values without explanation. Define constants with meaningful names instead.
*   **Nested Callbacks**:
    *   **Rationale**: Nested callbacks can make code difficult to read and debug (callback hell).
    *   Avoid excessive nesting of callbacks. Use Promises, async/await, or other techniques to flatten asynchronous code.
*   **Ignoring Errors**:
    *   **Rationale**: Ignoring errors can lead to unexpected behavior and make it difficult to diagnose problems.
    *   Never ignore errors. Always handle exceptions or log errors appropriately.
*   **Hardcoding Credentials**:
    *   **Rationale**: Hardcoding credentials poses a security risk.
    *   Never hardcode sensitive information such as API keys or database passwords directly in the code. Use environment variables or a secure configuration management system.
*   **Over-commenting**:
    *   **Rationale**: Over-commenting can clutter code and make it harder to read.
    *   Write clear, concise code that is self-explanatory where possible. Focus comments on explaining complex logic or non-obvious behavior.
*   **Console.log in Production**:
    *   **Rationale**: `console.log` statements can expose sensitive information and impact performance.
    *   Remove or disable `console.log` statements in production code. Use a logging service instead.
*   **Mutating Props Directly (React)**:
    *   **Rationale**: Mutating props directly violates the unidirectional data flow in React and can lead to unexpected behavior.
    *   Treat props as immutable. If you need to modify data, create a copy or derive a new value.

## 5. Architecture Patterns

### 5.1. Component/Module Structure Guidelines

*   **React Components**:
    *   Follow a component-based architecture.
    *   Create small, reusable components with a single responsibility.
    *   Use functional components with hooks for state management and side effects.
    *   Separate UI logic from business logic.
*   **Flask Modules**:
    *   Organize code into modules based on functionality.
    *   Use blueprints to group related routes.
    *   Create service classes to encapsulate business logic.
    *   Use models to represent database entities.

### 5.2. Data Flow Patterns

*   **React Frontend**:
    *   Unidirectional data flow: Data flows from parent components to child components via props.
    *   State updates trigger re-renders.
    *   Use event handlers to update state.
*   **Flask Backend**:
    *   RESTful API: Clients send requests to API endpoints.
    *   The backend processes requests and returns JSON responses.
    *   Use SQLAlchemy ORM to interact with the database.

### 5.3. State Management Conventions (React)

*   **Local State**: Use `useState` hook for component-specific state.
*   **Context API**: Use `Context` for sharing state between components without prop drilling.
*   **Redux/Zustand**: Use a state management library for managing global application state.

Example (React Context):

```javascript
// Create a context
const AttendeeContext = React.createContext();

// Create a provider component
function AttendeeProvider({ children }) {
    const [attendees, setAttendees] = React.useState([]);

    const value = {
        attendees,
        setAttendees,
    };

    return (
        <AttendeeContext.Provider value={value}>
            {children}
        </AttendeeContext.Provider>
    );
}

// Use the context in a component
function AttendeeList() {
    const { attendees } = React.useContext(AttendeeContext);

    return (
        <ul>
            {attendees.map(attendee => (
                <li key={attendee.id}>{attendee.name}</li>
            ))}
        </ul>
    );
}
```

### 5.4. API Design Standards

*   Use RESTful principles.
*   Use meaningful and consistent endpoint names.
*   Return appropriate HTTP status codes.
*   Use JSON for request and response bodies.
*   Implement pagination for large datasets.
*   Implement versioning for API changes.

Example:

*   `GET /attendees`: Retrieve a list of attendees.
*   `GET /attendees/{id}`: Retrieve a specific attendee.
*   `POST /attendees`: Create a new attendee.
*   `PUT /attendees/{id}`: Update an existing attendee.
*   `DELETE /attendees/{id}`: Delete an attendee.
