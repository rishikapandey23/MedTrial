from pymongo import MongoClient
from app.core.config import settings

# Attempt to connect to real MongoDB
# serverSelectionTimeoutMS fails fast if MongoDB is not running locally (zero-config local sandbox)
try:
    client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
    # Trigger a call to check if MongoDB is alive
    client.admin.command('ping')
    db = client[settings.MONGODB_DB_NAME]
    print("Connected to MongoDB successfully!")
except Exception:
    print("Warning: MongoDB server not running at settings.MONGODB_URI. Falling back to mongomock (in-memory MongoDB)...")
    import mongomock
    client = mongomock.MongoClient()
    db = client[settings.MONGODB_DB_NAME]

class MongoModel(dict):
    def __getattr__(self, name):
        try:
            return self[name]
        except KeyError:
            raise AttributeError(name)
            
    def __setattr__(self, name, value):
        self[name] = value

def get_db():
    try:
        yield db
    finally:
        pass
