import sys
import os

# Add the project directory to the Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Import the create_app function
from backend.app import create_app

# Create the application instance
app = create_app()

def create_app():
    """Create application instance for Waitress to use."""
    return app

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
