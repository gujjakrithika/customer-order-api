from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
 
from app.database import engine, Base
from app.routes.customer import router as customer_router
from app.routes.product import router as product_router
from app.routes.order import router as order_router
 
 
# Import all models
from app.models.customer import Customer
from app.models.product import Product
from app.models.order import Order
 
# Create tables
Base.metadata.create_all(bind=engine)
 
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

# Right below app = FastAPI(...):

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:3000",

        "http://localhost:5173",

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)
 
app.include_router(customer_router)
app.include_router(product_router)
app.include_router(order_router)
 
@app.get("/")
def root():
    return {"message": "Customer Order API is running"}
