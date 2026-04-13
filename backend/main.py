from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import math
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Let the frontend talk to us without complaining about security.
# We trust it... for now.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Product(BaseModel):
    id: int
    name: str
    category: str
    quantity: int
    price: float
    costPrice: float
    minStock: int


class Sale(BaseModel):
    id: int
    productId: int
    productName: str
    quantity: int
    total: float
    date: str


class PredictionRequest(BaseModel):
    products: List[Product]
    sales: List[Sale]
    budget: float
    current_date: str


def get_seasonality_multiplier(product_name: str, category: str, date_str: str):
    date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    month = date.month
    day = date.day

    multiplier = 1.0

    # Fancy keyword matching that I wrote instead of going to sleep.
    # It's not exactly NLP, but it works.
    name_lower = product_name.lower()

    # People get hungry during Ramadan. Let's stock up on dates.
    # My calendar says these dates are right... I think.
    if month in [2, 3]:
        if any(
            kw in name_lower
            for kw in ["date", "sweet", "nut", "oil", "sugar", "rice", "meat"]
        ):
            multiplier *= 2.5

    # The "I spent all my money on gifts" season.
    if month == 12:
        if any(
            kw in name_lower
            for kw in ["gift", "tree", "decor", "light", "chocolate", "toy"]
        ):
            multiplier *= 3.0
        if category.lower() in ["electronics", "accessories"]:
            multiplier *= 1.8

    # Kids need pens. Parents need coffee.
    if month in [8, 9]:
        if any(
            kw in name_lower
            for kw in ["notebook", "paper", "pen", "laptop", "desk", "chair"]
        ):
            multiplier *= 2.0
        if category.lower() == "office supplies":
            multiplier *= 1.5

    # It's too hot. Sell more fans.
    if month in [6, 7, 8]:
        if any(kw in name_lower for kw in ["fan", "cooler", "outdoor", "water"]):
            multiplier *= 2.2

    return multiplier


@app.post("/predict")
async def predict(request: PredictionRequest):
    products_df = pd.DataFrame([p.model_dump() for p in request.products])
    if products_df.empty:
        return {"recommendations": []}

    sales_df = pd.DataFrame([s.model_dump() for s in request.sales])

    recommendations = []

    for _, product in products_df.iterrows():
        # Looking back at what we actually sold in the last 30 days.
        product_sales = (
            sales_df[sales_df["productId"] == product["id"]]
            if not sales_df.empty
            else pd.DataFrame()
        )

        # Math for what happened in the past. 
        if not product_sales.empty:
            recent_sales = len(product_sales) 
            avg_daily_sales = (
                product_sales["quantity"].sum() / 30
            )  # 30 days because a month feels right.
        else:
            avg_daily_sales = 0.1  # Default low baseline. Better safe than sorry.

        # The magic brain does its thing here.
        seasonal_multiplier = get_seasonality_multiplier(
            product["name"], product["category"], request.current_date
        )

        # Guessing the future. I should've been a weather man.
        predicted_demand = math.ceil((avg_daily_sales * 30 + 1) * seasonal_multiplier)

        # How much more stuff do we need?
        # We want to buy enough to cover the guess + some extra.
        target_inventory = predicted_demand + product["minStock"]
        to_buy = max(0, target_inventory - product["quantity"])

        # "Buy all the things" - A Strategic approach.
        # If we have a budget, we can buy more than just the "required" units.
        # Max overstock = 2x predicted demand. Don't tell the accountant.
        max_to_buy = max(to_buy, predicted_demand * 2)

        if max_to_buy > 0:
            profit_per_unit = product["price"] - product["costPrice"]
            roi = (
                profit_per_unit / product["costPrice"]
                if product["costPrice"] > 0
                else 0
            )

            recommendations.append(
                {
                    "id": product["id"],
                    "name": product["name"],
                    "quantity": max_to_buy,
                    "price": product["price"],
                    "costPrice": product["costPrice"],
                    "predictedDemand": predicted_demand,
                    "roi": roi,
                    "totalCost": max_to_buy * product["costPrice"],
                    "totalProfit": max_to_buy * profit_per_unit,
                }
            )

    # Sorting by ROI (highest return first) because capitalism.
    # The classic knapsack problem. CS 101 coming in handy!
    recommendations.sort(key=lambda x: x["roi"], reverse=True)

    final_list = []
    remaining_budget = request.budget

    for item in recommendations:
        if remaining_budget <= 0:
            break

        # Checking the bank account... can we afford it?
        if item["totalCost"] <= remaining_budget:
            final_list.append(item)
            remaining_budget -= item["totalCost"]
        else:
            # Buying what we can. Stay in budget!
            qty_we_can_afford = int(remaining_budget // item["costPrice"])
            if qty_we_can_afford > 0:
                item["quantity"] = qty_we_can_afford
                item["totalCost"] = qty_we_can_afford * item["costPrice"]
                item["totalProfit"] = qty_we_can_afford * (
                    item["price"] - item["costPrice"]
                )
                final_list.append(item)
                remaining_budget -= item["totalCost"]

    return {"recommendations": final_list}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7680)
