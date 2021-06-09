from flask import Flask
from flask_jwt_extended import JWTManager

from app.database.models import db
from app.extensions import mongo
from app.routes import posts
from app.routes import user


def create_app(config_file='settings.py', test_config=None):
    app = Flask(__name__)
    app.config.from_pyfile(config_file)

    # Register MongoDB
    mongo.init_app(app)
    db.init_app(app)

    #jwt
    app.config["JWT_SECRET_KEY"] = "super-secret" #change this later
    jwt = JWTManager(app)

    # Register Routes, pass in "url_prefix=" for route prefixes
    app.register_blueprint(user.user)
    app.register_blueprint(posts.bp)
    return app

# No need to call create_app() manually, Flask should do this automatically when you set path of app to 'app'
