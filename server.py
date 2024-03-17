from fastapi import FastAPI, Query, WebSocket , WebSocketDisconnect
from sqlalchemy import create_engine, Column, Integer, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
app = FastAPI()
WebSocket_connection = []

SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
Base = declarative_base()

# Define table model for temperature and humidity
class Data(Base):
    __tablename__ = "data"
    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create table in the database
Base.metadata.create_all(bind=engine)

# Create session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Function to add data to database
def add_data_to_db(temperature: float, humidity: float):
    db = SessionLocal()
    db_data = Data(temperature=temperature, humidity=humidity)
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    db.close()

# API endpoint to accept temperature and humidity data
@app.post("/add_data/")
async def add_data(temperature: float = Query(...), humidity: float = Query(...)):
    for websocket in WebSocket_connection:
        data = {"temperature": temperature, "humidity": humidity, "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        await websocket.send_json({
            "type": "live_data",
            "data": data
        })
    add_data_to_db(temperature, humidity)
    return {"message": "Data added successfully"}



# WebSocket endpoint to provide real-time data updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print(WebSocket_connection)
    await websocket.accept()
    WebSocket_connection.append(websocket)
    try:
        # Send initial data to the client
        # get all data from database
        db = SessionLocal()
        db_data = db.query(Data).all()
        data = [{"temperature": data.temperature, "humidity": data.humidity, "timestamp": data.timestamp.strftime("%Y-%m-%d %H:%M:%S")} for data in db_data]

        await websocket.send_json({
            "type": "initial_data",
            "data": data
        })
        while True:
            data = await websocket.receive_text()
            print(data)

    except WebSocketDisconnect:
        WebSocket_connection.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)        