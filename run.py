from flask import Flask
from app.routes import article

def create_app():
    """
    Application factory for the Flask app.
    Registers all blueprints and returns the app instance.
    """
    app = Flask(__name__)

    # Register Blueprints
    app.register_blueprint(article)

    return app


if __name__ == "__main__":
    # Run the application in debug mode for development
    app = create_app()
    app.run(debug=True)
