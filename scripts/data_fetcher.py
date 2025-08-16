import requests
import json
import pandas as pd

def fetch_worldbank_data(country_code, indicator_code, start_year=1960, end_year=None):
    """
    Fetch data from World Bank API for a specific country and indicator
    """
    if end_year is None:
        end_year = pd.Timestamp.now().year
    
    url = f"http://api.worldbank.org/v2/country/{country_code}/indicator/{indicator_code}?format=json&date={start_year}:{end_year}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if len(data) < 2 or not data[1]:
            print(f"No data available for {country_code} - {indicator_code}")
            return None
            
        return data[1]
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

def save_data_to_json(data, filename):
    """Save data to a JSON file"""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    # Example usage
    indicators = {
        "GDP": "NY.GDP.MKTP.CD",
        "GDP_growth": "NY.GDP.MKTP.KD.ZG",
        "Inflation": "FP.CPI.TOTL.ZG",
        "Unemployment": "SL.UEM.TOTL.ZS"
    }
    
    ethiopia_data = {}
    
    for name, code in indicators.items():
        print(f"Fetching {name} data...")
        data = fetch_worldbank_data("ETH", code)
        if data:
            ethiopia_data[name] = data
            save_data_to_json(data, f"data/ethiopia_{name}.json")
    
    print("Data fetching complete.")
